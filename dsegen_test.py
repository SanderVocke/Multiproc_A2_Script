#TEST OF DSEGEN.PY

import dsegen

test_POOSL = False
test_XML_4core = True

if test_POOSL:
	file = dsegen.generate_DSE_POOSL(
			[("TriMedia", "1.0/1.0", "PB"),
			("ARM11", "1.0/1.0", "PB"),
			("MIPS", "1.0/1.0", "PB"),
			("MIPS", "1.0/1.0", "PB")],
			[(2,1),(1,2),(1,3),(0,4),(3,5),(0,6),(3,7),(2,8)],
			False,
			"S1")
			
	f = open("dse_test_output.poosl", "w")
	f.write(file)
	f.close()

if test_XML_4core:
	dsegen.generate_DSE_XML_4core(
			[("TriMedia", "1.0/1.0", "PB"),
			("ARM11", "1.0/1.0", "PB"),
			("MIPS", "1.0/1.0", "PB"),
			("MIPS", "1.0/1.0", "PB")],
			[(2,1),(1,2),(1,3),(0,4),(3,5),(0,6),(3,7),(2,8)],
			False,
			"S1",
			"./sim/dse_base_4core.xml",
			"./sim/dse_gen.xml")

