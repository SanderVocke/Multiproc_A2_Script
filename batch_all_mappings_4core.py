import analyze, config, dsegen, run, util, combinations
from os.path import isfile, join, exists
from os import makedirs

#SETTINGS
batchname = "batch_test"
cores = [("MIPS", "1.0/1.0", "PB"), #core 1
	("MIPS", "1.0/1.0", "PB"), #core 2
	("MIPS", "1.0/1.0", "PB"), #core 3
	("MIPS", "1.0/1.0", "PB")]
iterate = False
scenario = "S1"
dsebase = "./sim/dse_base_4core.xml"
dsetarget = "./sim/dse_gen.xml"
#/SETTINGS

batchpath = join("./outputs/data/", batchname)
if exists(batchpath):
	print("Directory for batch '" + batchname + "' exists. Exiting.")
	exit()
	
makedirs(batchpath)


