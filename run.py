import config
from subprocess import Popen

#runs the trace viewer with its current input.
def runTraceViewer():
	call([config.FIREFOX_PATH, config.TRACEVIEWER_PATH])
	
#runs the simulation based on the generated XML.
def runSim():
	Popen(['./sim/rotalumis.exe', '-f', 'dse_gen.xml'], cwd = './sim')