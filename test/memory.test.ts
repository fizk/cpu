import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import Memory from '../src/emulator/Memory.ts';

Deno.test("memory.readByte", () => {
    const memory = new Memory();
    memory.load(new Uint8Array([
        0x01, // 0 + 64 = 64 | 0x00
        0x02, // 1 + 64 = 65 | 0x01
        0x04, // 2 + 64 = 66 | 0x02
        0x08, // 3 + 64 = 67 | 0x03
        0x0f, // 4 + 64 = 68 | 0x04
    ]));

    // read from index: 0
    assertEquals(memory.readByte(0x00), 0x01);
    // read from index: 2
    assertEquals(memory.readByte(0x02), 0x04);
});

Deno.test("memory.readWord - little-endian", () => {
    const memory = new Memory();
    memory.load(new Uint8Array([
        0x00, // 0 + 64 = 64 | 0x00
        0x01, // 1 + 64 = 65 | 0x01
        0x02, // 2 + 64 = 66 | 0x02
        0x03, // 3 + 64 = 67 | 0x03
        0x04, // 4 + 64 = 68 | 0x04
    ]));

    // // read from index: 1 - 2
    assertEquals(memory.readWord(0x01), 0x0201);
    // // read from index: 2 - 3
    assertEquals(memory.readWord(0x02), 0x0302);
});

Deno.test("memory.writeByte", () => {
    const memory = new Memory();
    memory.load(new Uint8Array([
        0x01, // 0 + 64 = 64 | 0x00
        0x02, // 1 + 64 = 65 | 0x01
        0x04, // 2 + 64 = 66 | 0x02
        0x08, // 3 + 64 = 67 | 0x03
        0x0f, // 4 + 64 = 68 | 0x04
    ]));

    // // write into index: 1
    memory.writeByte(0x01, 0x5);
    assertEquals(memory.readByte(0x01), 0x5);

    // // read from index: 2
    assertEquals(memory.readByte(0x02), 0x04);
    // // write into index: 2
    memory.writeByte(0x02, 0x06);
    // // read from index: 2
    assertEquals(memory.readByte(0x02), 0x06);
});

Deno.test("memory.writeWord - little-endian", () => {
    const memory = new Memory();
    memory.load(new Uint8Array([
        0x00, // 0 + 64 = 64 | 0x00
        0x01, // 1 + 64 = 65 | 0x01
        0x02, // 2 + 64 = 66 | 0x02
        0x03, // 3 + 64 = 67 | 0x03
        0x04, // 4 + 64 = 68 | 0x04
    ]));

    // // read from index: 1 - 2
    assertEquals(memory.readWord(0x01), 0x0201);

    // // write word into index: 1 - 2
    memory.writeWord(0x01, 0x11ff);
    assertEquals(memory.readWord(0x01), 0x11ff);
});
