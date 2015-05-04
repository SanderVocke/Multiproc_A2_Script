
#generate_DSE_XML_4core: generates DSE XML file based on template.
#
# nodes:
# array of tuples (processor:String, VSF:String, OSPolicy:String), where:
#  - processor is a string ("TriMedia", "ARM11" or "MIPS")
#  - VSF is a string: "1.0/4.0", etc
#  - OSPolicy is one of "PB" or "FCFS"
#
# tasks:
# array of tuples (node:Integer, priority:Integer), where:
#  - node is index of the node to which task is mapped in the node array
#  - priority is the priority of the task
#
# iterate: boolean.
#
# scenario: one of "S1" or "S2"
#
# note that the nodes and tasks are 0-indexed but will be printed with an offset
# of 1 for compatibility to the POOSL model.
def generate_DSE_XML_4core(nodes, tasks, iterate, scenario, templatefile, targetfile):
	f = open(templatefile, "r")
	template = f.read()
	f.close()
	if iterate:
		template = template.replace("<ITERATESTRING>", "true")
	else:
		template = template.replace("<ITERATESTRING>", "false")
	template = template.replace("<SCENARIONAME>", scenario)
	for i,x in enumerate(nodes):
		template = template.replace("<PROCESSOR" + str(i+1) + ">", x[0])
		template = template.replace("<VSF" + str(i+1) + "L>", x[1].split("/")[0])
		template = template.replace("<VSF" + str(i+1) + "R>", x[1].split("/")[1])
		template = template.replace("<OSPOLICY" + str(i+1) + ">", x[2])
	for i,x in enumerate(tasks):
		template = template.replace("<TMAP" + str(i+1) + ">", "Node" + str(x[0]+1))
		template = template.replace("<PRIORITY" + str(i+1) + ">", str(x[1]))
		
	f = open(targetfile, "w")
	f.write(template)
	f.close()

#generate_DSE_POOSL: generates DSE POOSL file based on input parameters.
#
# nodes:
# array of tuples (processor:String, VSF:String, OSPolicy:String), where:
#  - processor is a string ("TriMedia", "ARM11" or "MIPS")
#  - VSF is a string: "1.0/4.0", etc
#  - OSPolicy is one of "PB" or "FCFS"
#
# tasks:
# array of tuples (node:Integer, priority:Integer), where:
#  - node is index of the node to which task is mapped in the node array
#  - priority is the priority of the task
#
# iterate: boolean.
#
# scenario: one of "S1" or "S2"
#
# note that the nodes and tasks are 0-indexed but will be printed with an offset
# of 1 for compatibility to the POOSL model.
def generate_DSE_POOSL(nodes, tasks, iterate, scenario):
	file = "/* System Specification */\n\n"
	file += "system\n"
	file += "instances\n"
	file += "\tApplication: Application(\n"
	file +=	"\t\t//You are allowed to change these parameters\n"
	if iterate:
		file +=	"\t\tIterate := true,\n"
	else:
		file +=	"\t\tIterate := false,\n"
	for i,x in enumerate(tasks):
		file += "\t\tMapTask" + str(i+1) + 'To := "Node' + str(x[0]+1) + '",\n'
	for i,x in enumerate(tasks):
		file += "\t\tPriorityTask" + str(i+1) + " := " + str(x[1]) + ",\n"
	file += '\t\tScenarioPart1 := "' + scenario + '",\n\n'
	file +=	"\t\t// Do not change the following parameters\n"
	file +=	"\t\tAccuracyCheckInterval := 0.03, DesiredLatency := 1.0/300.0,\n"
	file +=	"\t\tDesiredThroughput := 500.0\n"
	file +=	"\t)\n"
	file +=	"\tMPSoC: Platform(\n"
	file +=	"\t\t//You are allowed to change these parameters\n"
	for i,x in enumerate(nodes):
		file +=	"\t\tNode" + str(i+1) + 'ProcessorType := "' + x[0] + '",\n'
	file +=	"\n"
	for i,x in enumerate(nodes):
		file +=	"\t\tVSF" + str(i+1) + " := " + x[1] + ",\n"
	file +=	"\n"
	for i,x in enumerate(nodes):
		file +=	"\t\tOSPolicy" + str(i+1) + ' := "' + x[2] + '",\n'
	file +=	"\n"
	file +=	"\t\t// Do not change the following parameters\n"
	file +=	"\t\tNoC_BandwidthPerConnection := 10000000.0,\n"
	file +=	"\t\tNoC_ConnectionSetUpLatency := 0.00002,\n"
	file +=	"\t\tNode_InternalBandwidth := 200000000.0,\n"
	file +=	"\t\tNode_InternalConnectionSetUpLatency := 0.00001,\n"
	file +=	"\t\tPowerPerActiveConnection := 0.01, PowerPerStoredByte := 0.000001,\n"
	file +=	"\t\tAccuracyCheckInterval := 0.03, MaxEventTimeToLog := 0.1)\n"
	file +=	"\n"
	file +=	"channels\n"
	file +=	"\t{Application.Buffers, MPSoC.CommunicationResources }\n"
	file +=	"\t{Application.Tasks, MPSoC.ComputationResources }\n"
	file +=	"\t{Application.Status, MPSoC.Status }\n"
	file +=	"\n"

	return file