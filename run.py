#FUNCTIONS FOR RUNNING SIMULATIONS
import os
import config
from subprocess import Popen, call
	
#runs the simulation based on the generated XML in the ./sim folder.
def runSim():
	if os.name == 'nt':
		call(['./sim/rotalumis.exe', '-f', 'dse_gen.xml'], cwd = './sim')
	elif os.name == 'posix':
		os.chdir('./sim')
		call(['./rotalumis', '-f', 'dse_gen.xml'])
		os.chdir('./../')
