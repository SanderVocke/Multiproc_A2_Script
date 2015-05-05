# THIS STARTS A SIMULATION, STORES AWAY AND ANALYZES THE RESULT, THEN SHOWS THE TRACE VIEW.

import dsegen
import run
import analyze
import util

#generate a simulation setting
dsegen.generate_DSE_XML_4core(
	[("TriMedia", "1.0/1.0", "PB"), #core 1
	("ARM11", "1.0/1.0", "PB"), #core 2
	("MIPS", "1.0/1.0", "PB"), #core 3
	("MIPS", "1.0/1.0", "PB")], #core 4
	[(2,1),(1,2),(1,3),(0,4),(3,5),(0,6),(3,7),(2,8)], #tasks (0-indexed mappings)
	False, #iterate
	"S1", #scenario
	"./sim/dse_base_4core.xml", #base template file to use
	"./sim/dse_gen.xml") #output filename
	
run.runSim() #run the simulation

util.moveResults("./sim", "./outputs/data/test") #move the result files away to a different folder

util.doMakeTraceViewScript("./outputs/data/test", "./../../..", "./../..", "data/test")

results = analyze.analyzeResults('./outputs/data/test') #analyze sim results
print("Simulation results:\n" + str(results))

util.doTraceView("./outputs", "data/test") #show the trace view