#FUNCTIONS FOR RUNNING SIMULATIONS

import config
from subprocess import Popen, call
	
#runs the simulation based on the generated XML in the ./sim folder.
def runSim():
	call(['./sim/rotalumis.exe', '-f', 'dse_gen.xml'], cwd = './sim')