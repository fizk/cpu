# cpu

**6502 emulator**


### 6502 memory architecture
```
                size    %
[
  ['0000-00FF', 255	  ,  0.389],	// RAM for Zero-Page & Indirect-Memory Addressing
  ['0100-01FF', 255	  ,  0.389],	// RAM for Stack Space & Absolute Addressing
  ['0200-3FFF', 15871 , 24.22 ],	// RAM for programmer use
  ['4000-7FFF', 16383 , 25.00 ],	// Memory mapped I/O
  ['8000-FFF9', 32761 , 49.99 ],	// ROM for programmer useage
  ['FFFA-FFFB', 2	    ,  0.003],	// Vector address for NMI
  ['FFFC-FFFD', 2	    ,  0.003],	// Vector address for RESET
  ['FFFE-FFFF', 2	    ,  0.003],	// Vector address for IRQ & BRK
]
```


```
CLC			; clear carry bit
CLD			; clear decimal bit
LDA	ADR1	; load OP1 in A
ADC	ADR2	; add OP2 to OP1
STA	ADD3	; save red ar ADR3

ADR1 = $100
ADR2 = $120
ADR3 = $200
```