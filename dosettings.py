import dsegen
import util
import run
import analyze
from time import time
from os import listdir, remove, makedirs
from os.path import isfile, join, exists

coretypes = ["MIPS", "ARM11", "TriMedia"]

def genPart1DSEForSettings(settings, iterate, scenario):
	dsegen.generate_DSE_XML_4core(
	[(coretypes[settings[0]], "1.0/1.0", "PB"),
	(coretypes[settings[1]], "1.0/1.0", "PB"),
	(coretypes[settings[2]], "1.0/1.0", "PB"),
	(coretypes[settings[3]], "1.0/1.0", "PB")],
	[(settings[4],1),(settings[5],2),(settings[6],3),
	(settings[7],4),(settings[8],5),(settings[9],6),
	(settings[10],7),(settings[11],8)],
	iterate, scenario, "./sim/dse_base_4core.xml", "./sim/dse_gen.xml")

def countSettings(constraint_functions):
	count = 0
	for a in range(0,3): #core1 type (MIPS, ARM11, TriMedia)
		for b in range(0,3): #core2 type
			for c in range(0,3): #core3 type
				for d in range(0,3): #core4 type
					for e in range(0,4): #task1 map
						for f in range(0,4): #task2 map
							for g in range(0,4): #task3 map
								for h in range(0,4): #task4 map
									for i in range(0,4): #task5 map
										for j in range(0,4): #task6 map
											for k in range(0,4): #task7 map
												for l in range(0,4): #task8 map
													addSetting = True
													for x in constraint_functions:
														if not x((a,b,c,d,e,f,g,h,i,j,k,l)):
															addSetting = False
													if addSetting:
														count = count + 1
													
	return count
	
def doSingleSim(settings, base_folder, points_file, scenario):
	s = settings
	util.deleteRubbish('./sim')
	genPart1DSEForSettings(settings, False, scenario)
	run.runSim()
	r = analyze.analyzeResults("./sim")
	points_file.write("(%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u,%u):(%f,%f,%f,%u,%u)\n" % 
		(s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7],s[8],s[9],s[10],s[11],
		r['avgpower'],r['peakpower'],r['latency'],r['deadlinemiss'],r['coresused']))
	
def doSims(constraint_functions, base_folder, scenario):
	print("Counting settings...")
	total = countSettings(constraint_functions)
	print(str(total) + " settings found, starting.")
	done = 0
	starttime = time()
	if exists(base_folder):
		print("folder already exists.")
		exit()
	makedirs(base_folder)
	fl = open(join(base_folder, "allpoints.txt"), "w")
	for a in range(0,3): #core1 type (MIPS, ARM11, TriMedia)
		for b in range(0,3): #core2 type
			for c in range(0,3): #core3 type
				for d in range(0,3): #core4 type
					for e in range(0,4): #task1 map
						for f in range(0,4): #task2 map
							for g in range(0,4): #task3 map
								for h in range(0,4): #task4 map
									for i in range(0,4): #task5 map
										for j in range(0,4): #task6 map
											for k in range(0,4): #task7 map
												for l in range(0,4): #task8 map
													do = True
													for x in constraint_functions:
														if not x((a,b,c,d,e,f,g,h,i,j,k,l)):
															do = False
													if do:
														doSingleSim((a,b,c,d,e,f,g,h,i,j,k,l), base_folder, fl, scenario)
														done = done + 1
														curtime = time()
														seconds = int(curtime-starttime)%60
														minutes = int((curtime-starttime)/60)%60
														hours = int((curtime-starttime)/360)
														timetogo = (curtime-starttime)*(total-done)/(done)
														secondsg = int(timetogo)%60
														minutesg = int((timetogo)/60)%60
														hoursg = int((timetogo)/360)
														print("Done {0} of {1} simulations.".format(done,total))
														print("{0}:{1}:{2} taken, ETA {3}:{4}:{5}.".format(hours,minutes,seconds,hoursg,minutesg,secondsg))
	fl.close()