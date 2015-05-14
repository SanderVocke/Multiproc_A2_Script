#UTILITY FUNCTIONS (DELETING/MOVING SIMULATION RESULTS FILES, STARTING A TRACE VIEW)

from os import listdir, remove, makedirs
from os.path import isfile, join, exists
from shutil import copy
import config
from subprocess import Popen, call

coretypes = ["MIPS", "ARM11", "TriMedia"]

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
	
def makeParetoFixedCores(input, output, cores):
	pareto = []
	with open(input, "r") as o:
		for line in o:
			temp = line.replace('(', '').replace(')', '').replace('\n', '').split(':')
			settings = temp[0].split(',')
			results = temp[1].split(',')
			if int(results[4]) != cores or int(results[3]) > 5:
				continue
			if len(pareto) == 0:
				pareto.append((settings,results))
			else:
				put = True
				for i,x in enumerate(pareto):
					if int(x[1][4]) != cores:
						continue
					#if x dominates new point, don't put
					if float(x[1][0])<float(results[0]) and float(x[1][2])<float(results[2]):
						put = False
					elif float(x[1][0])>float(results[0]) and float(x[1][2])>float(results[2]):
						pareto.remove(x)
				if put:
					pareto.append((settings,results))
	f = open(output, "w")
	for x in pareto:
		f.write('(')
		f.write(str(x[0][0]))
		for y in x[0][1:]:
			f.write(',')
			f.write(str(y))
		f.write('):(')
		f.write(str(x[1][0]))
		for y in x[1][1:]:
			f.write(',')
			f.write(str(y))
		f.write(')\n')
	f.close()
	
def pointsToCSV(input, output):
	with open(output, "w") as o:
		o.write("AvgP,PkP,Lat,DM,Cores,Core1,Core2,Core3,Core4,T1,T2,T3,T4,T5,T6,T7,T8,\n")
		with open(input, "r") as i:
			for line in i:
				temp = line.replace('(', '').replace(')', '').replace('\n', '').split(':')
				s = temp[0].split(',')
				r = temp[1].split(',')
				o.write(r[0]+',')
				o.write(r[1]+',')
				o.write(r[2]+',')
				o.write(r[3]+',')
				o.write(r[4]+',')
				o.write(coretypes[int(s[0])]+',')
				o.write(coretypes[int(s[1])]+',')
				o.write(coretypes[int(s[2])]+',')
				o.write(coretypes[int(s[3])]+',')
				for h in range(4,12):
					o.write(s[h]+',')
				o.write('\n')

cores = ["MIPS", "ARM11", "TriMedia"]		
def doPointTraceView(pointstring, scenario):
	temp = pointstring.replace('(', '').replace(')', '').replace('\n', '').split(':')
	settings = temp[0].split(',')
	results = temp[1].split(',')
	dsegen.generate_DSE_XML_4core(
		[(cores[int(settings[0])], "1.0/1.0", "PB"),
		(cores[int(settings[1])], "1.0/1.0", "PB"),
		(cores[int(settings[2])], "1.0/1.0", "PB"),
		(cores[int(settings[3])], "1.0/1.0", "PB")],
		[(int(settings[4]),1),(int(settings[5]),2),(int(settings[6]),3),(int(settings[7]),4)
		,(int(settings[8]),5),(int(settings[9]),6),(int(settings[10]),7),(int(settings[11]),8)], 
		False, scenario, "./sim/dse_base_4core.xml", "./sim/dse_gen.xml")
	run.runSim()
	moveResults("./sim", "./outputs/data/temp")
	doMakeTraceViewScript("./outputs/data/temp", "./../../..", "./../..", "data/temp")
	results = analyze.analyzeResults('./outputs/data/temp') #analyze sim results
	print("Simulation results:\n" + str(results))
	doTraceView("./outputs", "data/temp") #show the trace view
