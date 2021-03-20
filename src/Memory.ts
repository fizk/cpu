export default class Memory {
    private memory: Uint8Array;

    constructor(size: number = 0xffff) {
        this.memory = new Uint8Array(size);
    }

    /**
     * Returns an unsigned 8bit number
     * @param address
     */
    public readByte(address: number): number {
        return this.memory[address];
    }

    /**
     * @param address 8bit
     * @param value 8bit
     */
    public writeByte(address: number, value: number): void {
        this.memory[address] = value;
    }

    /**
     * Returns an unsigned 16bit number
     * @param address
     */
    public readWord(address: number): number {
        let value = this.memory[address + 1] << 8;
        return value |= this.memory[address];
    }

    /**
     * Writes a 16bit Word into two bytes.
     * Uses big-endian
     *
     * @param address 8bit
     * @param value 16bit
     */
    public writeWord(address: number, value: number): void {
        const hight = value >> 8;
        const low = value & 0b0000000011111111;
        this.memory[address] = low;
        this.memory[address + 1] = hight;
    }

    public load(source: Uint8Array): void {
        source.forEach((byte, i) => this.memory[i] = byte);
    }

    public dump(from = 0x0, to = 0x0) {
        const memoryCopy = this.memory.slice(from, to);
        function* chunks(arr: Uint8Array, n: number) {
            for (let i = 0;i < arr.length;i += n) {
                yield arr.slice(i, i + n);
            }
        }

        let line = from;
        for (const item of chunks(memoryCopy, 16)) {
            const entry = item.reduce((previous, current) => {
                return previous += `${current.toString(16).padStart(2, '0')} `;
            }, `${(line).toString(16)} | `);
            line += 16;
            console.log(entry);
        }
    }
}