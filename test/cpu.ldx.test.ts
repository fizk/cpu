import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import Memory from '../src/Memory.ts';
import CPU from '../src/CPU.ts';

Deno.test("CPU.INSTRUCTIONS.LDX_I", () => {
    const memory = new Memory();
    const cpu = new CPU(memory);
    cpu.loadProgram(new Uint8Array([
        CPU.INSTRUCTIONS.LDX_I,
        0xFF,
        CPU.INSTRUCTIONS.HALT,
    ]));
    cpu.run();

    assertEquals(cpu.x, 0xff);

    memory.dump(0xff00, 0xffff);
});