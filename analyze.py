#FUNCTIONS FOR ANALYZING RESULTS OF SIMS
from os import listdir
from os.path import isfile, join
import re

def analyzeResults(path):
	#find the number of cores that were active
	cores_used = 0
	onlyfiles = [ f for f in listdir(path) if isfile(join(path,f)) ]
	for x in onlyfiles:
		if "ProcessorTraceNode" in x:
			f = open(join(path,x), "r")
			if "<start task" in f.read():
				cores_used = cores_used + 1
			f.close()
	
	#find latency
	f = open(path+"/Application.log")
	content = f.read()
	f.close()
	match = re.search("Latency: ([0-9]*.[0-9]*)", content)
	latency = float(match.group(1))	
	#find deadline misses
	match = re.search("([0-9]*)% Deadline Misses", content)
	deadlinemisses = int(match.group(1))
	
	#find peak power
	f = open(path+"/Battery.log")
	content = f.read()
	f.close()
	match = re.search("Peak Power Consumption: ([0-9]*.[0-9]*) Watts", content)
	peakpower = float(match.group(1))	
	#find average power
	match = re.search("Observed Average Power: ([0-9]*.[0-9]*) Watts", content)
	avgpower = float(match.group(1))
	
	return {'avgpower':avgpower, 'peakpower':peakpower, 'latency':latency, 'deadlinemiss':deadlinemisses, 'coresused':cores_used}