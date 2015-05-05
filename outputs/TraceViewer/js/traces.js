function popContentFor(startTime, endTime, iter) {
    return 'Start time: ' + startTime.toString() +
            'us; End time: ' + endTime.toString() +
            'us; Duration: ' + (endTime - startTime).toString() +
            'us; Iteration: ' + (iter).toString();
}

function addProcTrace(xml, i) {
    var open = false;
    var startTime = 0;
    var endTime = 0;
    var taskName = "";
    var iterations = {};

    src[i].desc = $(xml).find("trace").attr("name");

    $(xml).find("trace").children().each(
            function () {
                switch (this.nodeName) {
                    case "contextswitch":
                        endTime = Math.round(1000000.0 * parseFloat(this.getAttribute("time")));
                        src[i].values.push({
                            "from": startTime,
                            "to": endTime,
                            "label": "CS",
                            "customClass": "ganttCS",
                            "dataObj": {
                                popTitle: "Context Switch for " + taskName,
                                popContent: popContentFor(startTime, endTime, iterations[taskName])
                            }
                        });
                        startTime = endTime;
                        break;
                    case "start":
                        open = true;
                        startTime = Math.round(1000000.0 * parseFloat(this.getAttribute("time")));
                        taskName = this.getAttribute("task");
                        iterations[taskName] = this.getAttribute("iteration");
                        break;
                    case "preemption":
                        open = false;
                        endTime = Math.round(1000000.0 * parseFloat(this.getAttribute("time")));
                        src[i].values.push({
                            "from": startTime,
                            "to": endTime,
                            "label": taskName,
                            "customClass": colors[iterations[taskName] % colors.length],
                            "dataObj": {
                                popTitle: "Preempted execution of " + taskName,
                                popContent: popContentFor(startTime, endTime, iterations[taskName])
                            }
                        });
                        break;
                    case "stop":
                        open = false;
                        endTime = Math.round(1000000.0 * parseFloat(this.getAttribute("time")));
                        src[i].values.push({
                            "from": startTime,
                            "to": endTime,
                            "label": taskName,
                            "customClass": colors[iterations[taskName] % colors.length],
                            "dataObj": {
                                popTitle: "Completion of " + taskName,
                                popContent: popContentFor(startTime, endTime, iterations[taskName])
                            }
                        });
                        break;
                }
            }
    );

}

function addCommTrace(xml, name) {
    var startTime = 0;
    var endTime = 0;
    var commName = "";
    var iterations = {};
    var startTimes = {};
    var endTimes = {};
    var commIndices = {};
    var indexComms = {};
    var base = src.length;
    var desc = $(xml).find("trace").attr("name");

    var w = widthOfCommTrace(xml);
    var i;
    for (i = 0; i < w; i++) {
        src.push({
            name: name,
            desc: desc,
            values: []
        });
    }
    $(xml).find("trace").children().each(
            function () {
                switch (this.nodeName) {
                    case "start":
                        commName = this.getAttribute("channel");
                        startTimes[commName] = Math.round(1000000.0 * parseFloat(this.getAttribute("time")));
                        iterations[commName] = this.getAttribute("iteration");
                        var index = 0;
                        while (index in indexComms) index++;
                        commIndices[commName] = index;
                        indexComms[index] = commName;
                        break;
                    case "end":
                        endTime = Math.round(1000000.0 * parseFloat(this.getAttribute("time")));
                        commName = this.getAttribute("channel");
                        var index = commIndices[commName];
                        src[base + index].values.push({
                            "from": startTimes[commName],
                            "to": endTime,
                            "label": commName,
                            "customClass": colors[iterations[commName] % colors.length],
                            "dataObj": {
                                popTitle: "Communication for " + commName,
                                popContent: popContentFor(startTimes[commName], endTime, iterations[commName])
                            }
                        });
                        delete indexComms[index];
                        delete commIndices[commName];
                        break;
                }
            }
    );
}

function addMemTrace(mem, xml, id, color) {
    var currentAmount = 0;
    var data =[];
    mem[id] = {lines: { show: true, fill: true }, color: color, label: id, name: id, data : data};
    $(xml).find("trace").children().each(
            function () {
                switch (this.nodeName) {
                    case "claim":
                        t = Math.round(1000000.0 * parseFloat(this.getAttribute("time")));
                        data.push([t, currentAmount]);
                        currentAmount += parseFloat(this.getAttribute("amount"));
                        data.push([t, currentAmount]);
                        break;
                    case "release":
                        t = Math.round(1000000.0 * parseFloat(this.getAttribute("time")));
                        data.push([t, currentAmount]);
                        currentAmount -= parseFloat(this.getAttribute("amount"));
                        data.push([t, currentAmount]);
                        break;
                }
            }
    );
}

function widthOfCommTrace(xml) {
    var commName = "";
    var commIndices = {};
    var indexComms = {};
    var width = 0;
    $(xml).find("trace").children().each(
            function () {
                switch (this.nodeName) {
                    case "start":
                        commName = this.getAttribute("channel");
                        var index = 0;
                        while (index in indexComms) index++;
                        commIndices[commName] = index;
                        indexComms[index] = commName;
                        if (index+1 > width) width = index+1;
                        break;
                    case "end":
                        commName = this.getAttribute("channel");
                        var index = commIndices[commName];
                        delete indexComms[index];
                        delete commIndices[commName];
                        break;
                }
            }
    );
    return width;
}

