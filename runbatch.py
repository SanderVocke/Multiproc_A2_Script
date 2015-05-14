import dosettings
import constraints
import util
import os

def runbatch(constraints,path,scenario):
	dosettings.doSims(constraints, path, scenario)
	#make all pareto files
	util.makeParetoFixedCores(os.path.join(path,'allpoints.txt'), os.path.join(path,'pareto1.txt'), 1)
	util.makeParetoFixedCores(os.path.join(path,'allpoints.txt'), os.path.join(path,'pareto2.txt'), 2)
	util.makeParetoFixedCores(os.path.join(path,'allpoints.txt'), os.path.join(path,'pareto3.txt'), 3)
	util.makeParetoFixedCores(os.path.join(path,'allpoints.txt'), os.path.join(path,'pareto4.txt'), 4)
	#make all CSV
	util.pointsToCSV(os.path.join(path,'pareto1.txt'), os.path.join(path,'pareto1.csv'))
	util.pointsToCSV(os.path.join(path,'pareto2.txt'), os.path.join(path,'pareto2.csv'))
	util.pointsToCSV(os.path.join(path,'pareto3.txt'), os.path.join(path,'pareto3.csv'))
	util.pointsToCSV(os.path.join(path,'pareto4.txt'), os.path.join(path,'pareto4.csv'))
	