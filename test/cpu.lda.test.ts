import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import Memory from '../src/Memory.ts';
import CPU from '../src/CPU.ts';

Deno.test("CPU.INSTRUCTIONS.LDA_I", () => {
    const memory = new Memory();
    const cpu = new CPU(memory);
    cpu.loadProgram(new Uint8Array([
        CPU.INSTRUCTIONS.LDA_I,
        0xFF,
        CPU.INSTRUCTIONS.HALT,
    ]));

    cpu.run();
    assertEquals(cpu.a, 0xff);
});

Deno.test("CPU.INSTRUCTIONS.LDA_ZP", () => {
    const memory = new Memory();
    const cpu = new CPU(memory);
    //write into zero-page:
    memory.writeByte(0x00, 0xaa);

    cpu.loadProgram(new Uint8Array([
        CPU.INSTRUCTIONS.LDA_ZP,
        0x00,
        CPU.INSTRUCTIONS.HALT,
    ]));

    cpu.run();
    assertEquals(cpu.a, 0xaa);
});

Deno.test("CPU.INSTRUCTIONS.LDA_ZPX", () => {
    const memory = new Memory();
    const cpu = new CPU(memory);
    //write into zero-page:
    memory.writeByte(0x8F, 0xbb);

    cpu.loadProgram(new Uint8Array([
        CPU.INSTRUCTIONS.LDX_I,
        0x0f, //< -- first half of the zero-page address
        CPU.INSTRUCTIONS.LDA_ZPX,
        0x80, //< -- second half of the zero-page address
        CPU.INSTRUCTIONS.HALT,
    ]));

    cpu.run();
    assertEquals(cpu.a, 0xbb);
});