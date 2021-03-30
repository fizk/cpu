// @ts-ignore | stupid tc, does not allow extensions
import type Memory from './Memory.ts';

/**
 * Relatively simple 8 bit CPU with only a few internal registers capable of addressing at most 64Kb of
 * memory via its 16 bit address bus.
 *
 * The first 256 byte page of memory($0000 - $00FF) is referred to as 'Zero Page'
 * The second page of memory ($0100-$01FF) is reserved for the system stack and which cannot be relocated.
 * The only other reserved locations in the memory map are the very last 6 bytes of
 * memory $FFFA to $FFFF which must be programmed with the addresses of the non-maskable interrupt
 * handler ($FFFA/B), the power on reset location ($FFFC/D) and the BRK/interrupt request handler ($FFFE/F)
 * respectively.
 */
export default class CPU {

    /**
     *  0000-00FF  - RAM for Zero-Page & Indirect-Memory Addressing
     *  0100-01FF  - RAM for Stack Space & Absolute Addressing
     *  0200-3FFF  - RAM for programmer use
     *  4000-7FFF  - Memory mapped I/O
     *  8000-FFF9  - ROM for programmer useage
     *  FFFA       - Vector address for NMI (low byte)
     *  FFFB       - Vector address for NMI (high byte)
     *  FFFC       - Vector address for RESET (low byte)
     *  FFFD       - Vector address for RESET (high byte)
     *  FFFE       - Vector address for IRQ & BRK (low byte)
     *  FFFF       - Vector address for IRQ & BRK  (high byte)
     *
     *  https://www.csh.rit.edu/~moffitt/docs/6502.html#MEM_MAP
     */
    private memory: Memory;
    private romStart = 0x8000;
    private resetVectorStart = 0xfffc;
    private breakVectorStart = 0xfffe;

    /**
     * Program Counter
     * The program counter is a 16 bit register which points to the next instruction to be executed.
     * The value of program counter is modified automatically as instructions are executed.
     */
    private pc = 0x0; //16bit

    /**
     * Stack Pointer
     * The processor supports a 256 byte stack located between $0100 and $01FF.
     * The stack pointer is an 8 bit register and holds the low 8 bits of the next free
     * location on the stack.The location of the stack is fixed and cannot be moved.
     */
    private sp = 0x0; //8bit

    /**
     * Accumulator
     * The 8 bit accumulator is used all arithmetic and logical operations
     * (with the exception of increments and decrements). The contents of the accumulator
     * can be stored and retrieved either from memory or the stack.
     */
    private ac = 0x0; //8bit

    /**
     * Index Register X
     * The 8 bit index register is most commonly used to hold counters or offsets for accessing memory.
     * The value of the X register can be loaded and saved in memory, compared with values held in memory
     * or incremented and decremented.
     *
     * The X register has one special function.It can be used to get a copy of the stack pointer or change its value.
     */
    private rx = 0x0; //8bit

    /**
     * Index Register Y
     * The Y register is similar to the X register in that it is available for holding counter or
     * offsets memory access and supports the same set of memory load, save and compare operations as
     * wells as increments and decrements. It has no special functions.
     */
    private ry = 0x0; //8bit

    /**
     * Processor Status
     * As instructions are executed a set of processor flags are set or clear to record the results of
     * the operation. This flags and some additional control flags are held in a special status register.
     * Each flag has a single bit within the register.
     *
     * Carry Flag (C)
     * The carry flag is set if the last operation caused an overflow from bit 7 of the result or an
     * underflow from bit 0. This condition is set during arithmetic, comparison and during logical shifts.
     *
     * Zero Flag (Z)
     * The zero flag is set if the result of the last operation as was zero.
     *
     * Interrupt Disable (I)
     * The interrupt disable flag is set if the program has executed a 'Set Interrupt Disable' (SEI) instruction.
     * While this flag is set the processor will not respond to interrupts from devices until it is
     * cleared by a 'Clear Interrupt Disable' (CLI) instruction.
     *
     * Decimal Mode (D)
     * While the decimal mode flag is set the processor will obey the rules of Binary Coded Decimal (BCD)
     * arithmetic during addition and subtraction. The flag can be explicitly set using 'Set Decimal Flag' (SED)
     * and cleared with 'Clear Decimal Flag' (CLD).
     *
     * Break Command (B)
     * The break command bit is set when a BRK instruction has been executed and an interrupt has been
     * generated to process it.
     *
     * Overflow Flag (V)
     * The overflow flag is set during arithmetic operations if the result has yielded an invalid 2's
     * complement result (e.g. adding to positive numbers and ending up with a negative result: 64 + 64 => -128).
     * It is determined by looking at the carry between bits 6 and 7 and between bit 7 and the carry flag.
     *
     * Negative Flag (N)
     * The negative flag is set if the result of the last operation had bit 7 set to a one.
     *
     * +---+---+---+---+---+---+---+---+
     * | n | v | . | b | d | i | z | c |
     * +---+---+---+---+---+---+---+---+
     */
    private flags = 0b00000000; //8bit

    static INSTRUCTIONS = {
        // LDA - Load Accumulator
        // Loads a byte of memory into the accumulator setting the zero and negative flags as appropriate.
        LDA_I: 0xA9,    // * Immediate 	    2 2
        LDA_ZP: 0xA5,   // * Zero Page 	    2 3
        LDA_ZPX: 0xB5,  //   Zero Page,X    2 4
        LDA_A: 0xAD,    //   Absolute 	    3 4
        LDA_AX: 0xBD,   //   Absolute,X 	3 4 (+1 if page crossed)
        LDA_AY: 0xB9,   //   Absolute,Y 	3 4 (+1 if page crossed)
        LDA_IX: 0xA1,   //   (Indirect,X)   2 6
        LDA_IY: 0xB1,   //   (Indirect),Y   2 5 (+1 if page crossed)


        //LDX - Load X Register
        //Loads a byte of memory into the X register setting the zero and negative flags as appropriate.
        LDX_I: 0xA2,    // * Immediate	    2 2
        LDX_ZP: 0xA6,   //   Zero Page	    2 3
        LDX_ZPY: 0xB6,  //   Zero Page,Y	2 4
        LDX_A: 0xAE,    //   Absolute		3 4
        LDX_AY: 0xBE,   //   Absolute,Y	    3 4 (+1 if page crossed)

        //HALT
        HALT: 0xff,     // temp value, 'cause I don't know how to stop the program :(

    };

    constructor(memory: Memory) {
        this.memory = memory;
    }

    /**
     * Read-only program-counter
     */
    get p() {
        return this.pc;
    }

    /**
     * Read-only accumulator
     */
    get a() {
        return this.ac;
    }

    /**
     * Read-only register X
     */
    get x() {
        return this.rx;
    }
    /**
     * Read-only register Y
     */
    get y() {
        return this.ry;
    }

    /**
     * Read-only flags | 8bit
     */
    get f() {
        return this.flags;
    }

    /**
     * Read-only stack-pointer
     */
    get s() {
        return this.sp;
    }

    /**
     * The RESET VECTOR store the address of where the program should start
     * executing.
     *
     * This method reads a `word` from the reset-vector (which should be 0xFFFC/0xFFFD)
     * and places it in the Program Counter.
     *
     * https://www.pagetable.com/?p=410
     */
    private reset() {
        //Write the RESET vector into address(this.resetVectorStart)
        //  The value written is then the ROM starts
        this.memory.writeWord(this.resetVectorStart, this.romStart);
        this.memory.writeWord(this.breakVectorStart, 0xffee);

        //Read the address in memory location(this.resetVectorStart)
        // into the Program Counter.
        // This is where the Emulator will start reading instructions from.
        this.pc = this.memory.readWord(this.resetVectorStart);
    }

    /**
     * C	Carry Flag			Not affected
     * Z	Zero Flag			Set if A = 0
     * I	Interrupt Disable	Not affected
     * D	Decimal Mode Flag	Not affected
     * B	Break Command		Not affected
     * .
     * V	Overflow Flag		Not affected
     * N	Negative Flag		Set if bit 7 of A is set
     */
    private setLdaFlags() {
        // z = a==0
        // n = (a & 0b10000000) > 0
    }
    /**
     * C	Carry Flag	        Not affected
     * Z	Zero Flag	        Set if X = 0
     * I	Interrupt Disable	Not affected
     * D	Decimal Mode Flag	Not affected
     * B	Break Command	    Not affected
     * .
     * V	Overflow Flag	    Not affected
     * N	Negative Flag	    Set if bit 7 of X is set
     */
    private setLdxFlags() {

    }

    loadProgram(source: Uint8Array): void {
        // Fill memory with instructions, starting from
        // `this.romStart`
        source.forEach((byte, i) => this.memory.writeByte(i + this.romStart, byte));
    }

    run(): void {
        this.reset();
        let running = true;
        while (running) {
            const opcode = this.memory.readByte(this.pc);
            this.pc++;
            switch (opcode) {
                //LDA:Immediate
                // Immediate addressing allows the programmer to directly specify an 8 bit
                // constant within the instruction.It is indicated by a '#' symbol followed
                // by an numeric expression.For example:
                // `LDA #10         ;Load 10 ($0A) into the accumulator`
                case CPU.INSTRUCTIONS.LDA_I: {
                    this.ac = this.memory.readByte(this.pc);
                    this.pc++;
                    this.setLdaFlags();
                    console.log(`CPU.INSTRUCTIONS.LDA_I | ac: ${this.ac}`);
                } break;

                //LDA:Zero Page
                // An instruction using zero page addressing mode has only an 8 bit address operand.
                // This limits it to addressing only the first 256 bytes of memory(e.g.$0000 to $00FF)
                // where the most significant byte of the address is always zero.In zero page mode only
                // the least significant byte of the address is held in the instruction making it shorter
                // by one byte(important for space saving) and one less memory fetch during execution(important for speed).
                // `LDA $00         ;Load accumulator from $00`
                case CPU.INSTRUCTIONS.LDA_ZP: {
                    const operand = this.memory.readByte(this.pc);
                    this.ac = this.memory.readByte(operand);
                    this.pc++;
                    this.setLdaFlags();
                    console.log(`CPU.INSTRUCTIONS.LDA_ZP | operand: ${operand.toString(16)}`);
                } break;

                //LDA:Zero Page,X
                // The address to be accessed by an instruction using indexed zero page addressing is calculated by
                // taking the 8 bit zero page address from the instruction and adding the current value of the X
                // register to it.For example if the X register contains $0F and the instruction LDA $80, X is executed
                // then the accumulator will be loaded from $008F(e.g.$80 + $0F => $8F).
                case CPU.INSTRUCTIONS.LDA_ZPX: {
                    const operand = this.memory.readByte(this.pc);
                    this.ac = this.memory.readByte(this.rx + operand);
                    this.pc++;
                    this.setLdaFlags();
                    console.log(`CPU.INSTRUCTIONS.LDA_ZPX | operand: ${operand.toString(16)}, x:${this.rx.toString(16)},  zp:${(this.rx + operand).toString(16)}`);
                } break;


                //LDX:Immediate
                case CPU.INSTRUCTIONS.LDX_I: {
                    this.rx = this.memory.readByte(this.pc);
                    this.pc++;
                    this.setLdxFlags();
                    console.log('CPU.INSTRUCTIONS.LDX_I');
                } break;



                case CPU.INSTRUCTIONS.HALT: {
                    console.log('CPU.INSTRUCTIONS.HALT');
                    running = false;
                } break;
                default: {
                    throw new Error(`undefined op-code ${opcode}`);
                }
            }
        }
    }
}
