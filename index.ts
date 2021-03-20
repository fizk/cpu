import Memory from './src/Memory.ts';
import CPU from './src/CPU.ts';


const memory = new Memory();
//write into zero-page:
memory.writeByte(0x8F, 0xbb);

const cpu = new CPU(memory);
cpu.loadProgram(new Uint8Array([
    CPU.INSTRUCTIONS.LDX_I,
    0x0f, //< -- first half of the zero-page address
    CPU.INSTRUCTIONS.LDA_ZPX,
    0x80, //< -- second half of the zero-page address
    CPU.INSTRUCTIONS.HALT,
]));
cpu.run();