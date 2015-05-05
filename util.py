#UTILITY FUNCTIONS (DELETING/MOVING SIMULATION RESULTS FILES, STARTING A TRACE VIEW)

from os import listdir, remove, makedirs
from os.path import isfile, join, exists
from shutil import copy
import config
from subprocess import Popen, call

def deleteRubbish(path):
	ignore = [line.strip() for line in open(path+'/file_ignorelist.txt')]	
	onlyfiles = [ f for f in listdir(path) if isfile(join(path,f)) ]
	for x in onlyfiles:
		if not x in ignore:
			remove(path+'/'+x)
			
def moveResults(sourcepath, targetpath):
	ignore = [line.strip() for line in open(sourcepath+'/file_ignorelist.txt')]	
	onlyfiles = [ f for f in listdir(sourcepath) if isfile(join(sourcepath,f)) ]
	if not exists(targetpath):
		makedirs(targetpath)
	for x in onlyfiles:
		if not x in ignore:
			copy(sourcepath+'/'+x, targetpath+'/'+x)
			remove(sourcepath+'/'+x)
			
def doTraceView(traceviewpath, relpath):
	f = open(join(traceviewpath, "traceviewer_template.html"), "r")
	content = f.read()
	f.close()
	content = content.replace("<DATALOC>", relpath)
	f = open(join(traceviewpath, "traceviewer_gen.html"), "w")
	f.write(content)
	f.close()
	call([config.FIREFOX_PATH, join(traceviewpath, "traceviewer_gen.html")])
	
#puts a script in relpath, that can run a traceview of the data in that path.
#the name will be "traceview.py".
#traceviewrelrelpath is the relative path to the trace viewer HTML, RELATIVE TO THE PATH IN WHICH
#THE SCRIPT IS GENERATED.
#traceviewtodatapath is the relative path from the trace viewer HTML to the data folder.
def doMakeTraceViewScript(relpath, inverserelpath, traceviewrelrelpath, traceviewtodatapath):
	f = open(join(relpath, "traceview.py"), "w")
	f.write("from os import listdir, remove, makedirs\n")
	f.write("from os.path import isfile, join, exists, abspath\n")
	f.write("import sys\n")
	f.write("from shutil import copy\n")
	f.write("lib_path = abspath('"+inverserelpath+"')\n")
	f.write("if lib_path not in sys.path:\n")
	f.write("\tsys.path.append(lib_path)\n")
	f.write("import config\n")
	f.write("from subprocess import Popen, call\n\n")
	f.write('traceviewpath = "'+traceviewrelrelpath+'"\n')
	f.write('relpath = "'+traceviewtodatapath+'"\n')
	f.write('f = open(join(traceviewpath, "traceviewer_template.html"), "r")\n')
	f.write('content = f.read()\n')
	f.write('f.close()\n')
	f.write('content = content.replace("<DATALOC>", relpath)\n')
	f.write('f = open(join(traceviewpath, "traceviewer_gen.html"), "w")\n')
	f.write('f.write(content)\n')
	f.write('f.close()\n')
	f.write('call([config.FIREFOX_PATH, join(traceviewpath, "traceviewer_gen.html")])\n')	
	f.close()
	