const dataSource = {
    allTime: "./data/M_vs_R_La_AllTime.csv",
    liga: "./data/M_vs_R_La_Liga.csv",
    nationalTeam: "./data/M_vs_R_Natioal_Team.csv",
};

const w = 1100;
const h = 650;
const padding = { top: 70, right: 65, bottom: 50, left: 150 };
const contentWidth = w - padding.right - padding.left;
const contentHeight = h - padding.top - padding.bottom;
const color = d3
    .scaleOrdinal()
    .domain(["messi", "ronaldo"])
    .range(d3.schemePastel1);

const svg = d3
    .select(".container")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

const content = svg
    .append("g")
    .attr("transform", `translate(${padding.left}, ${padding.top})`);
const title = svg
    .append("text")
    .text("Messi vs Ronaldo La All Time")
    .attr("font-size", 30)
    .attr("text-anchor", "middle")
    .attr("x", w / 2)
    .attr("y", 45);
const legend = content.append("g");

legend
    .selectAll("rect")
    .data(["messi", "ronaldo"])
    .join("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", (d) => color(d))
    .attr("y", (d, i) => i * 30);
legend
    .selectAll("text")
    .data(["messi", "ronaldo"])
    .join("text")
    .text((d) => d.charAt(0).toUpperCase() + d.slice(1))
    .attr("x", 30)
    .attr("y", (d, i) => i * 30 + 15);

let xScale, yScale, allTimeData, ligaData, nationalTeamData;
const xAxisContainer = content.append("g");
const yAxisContainer = content.append("g");
const statistic = content.append("g");

const renderData = (dataset) => {
    const messiData = statistic
        .selectAll(".messi")
        .data(dataset, (d) => d.category)
        .join("g")
        .attr("class", "messi");
    const ronaldoData = statistic
        .selectAll(".ronaldo")
        .data(dataset, (d) => d.category)
        .join("g")
        .attr("class", "ronaldo");

    const messiDataRect = messiData
        .selectAll("rect")
        .data((d) => [d])
        .join("rect")
        .attr("height", yScale.bandwidth() / 2)
        .attr("fill", color("messi"))
        .attr("y", (d) => yScale(d.category));
    messiDataRect
        .transition()
        .duration(1000)
        .attr("width", (d) => xScale(d.messi));
    const messiDataText = messiData
        .selectAll("text")
        .data((d) => [d])
        .join("text")
        .attr("font-size", 12)
        .attr("y", (d) => yScale(d.category) + 11);
    messiDataText
        .transition()
        .duration(1000)
        .attr("x", (d) => xScale(d.messi) + 5)
        .textTween(function (d) {
            return d3.interpolateRound(Number(this.innerHTML || 0), d.messi);
        });

    const ronaldoDataRect = ronaldoData
        .selectAll("rect")
        .data((d) => [d])
        .join("rect")
        .attr("height", yScale.bandwidth() / 2)
        .attr("fill", color("ronaldo"))
        .attr("y", (d) => yScale(d.category) + yScale.bandwidth() / 2);
    ronaldoDataRect
        .transition()
        .duration(1000)
        .attr("width", (d) => xScale(d.ronaldo));

    const ronaldoDataText = ronaldoData
        .selectAll("text")
        .data((d) => [d])
        .join("text")
        .attr("font-size", 12)
        .attr("y", (d) => yScale(d.category) + 27);
    ronaldoDataText
        .transition()
        .duration(1000)
        .attr("x", (d) => xScale(d.ronaldo) + 5)
        .textTween(function (d) {
            return d3.interpolateRound(Number(this.innerHTML || 0), d.ronaldo);
        });
};

const formattedData = (data) =>
    data.map((item) => ({
        category: item["International"] || item[""],
        messi: Number(item["Lionel Messi"]),
        ronaldo:
            Number(item[" Christiano Ronaldo"]) ||
            Number(item["Christiano Ronaldo"]),
    }));

const initRender = async () => {
    legend.attr("transform", "translate(500, 50)");
    allTimeData = (await d3.csv(dataSource.allTime)).slice(0);
    ligaData = (await d3.csv(dataSource.liga)).slice(0);
    nationalTeamData = (await d3.csv(dataSource.nationalTeam)).slice(0);
    allTimeData = formattedData(allTimeData);
    ligaData = formattedData(ligaData);
    nationalTeamData = formattedData(nationalTeamData);

    const yAxisData = Array.from(
        new Set([
            ...allTimeData.map((item) => item.category),
            ...ligaData.map((item) => item.category),
            ...nationalTeamData.map((item) => item.category),
        ])
    );

    xScale = d3
        .scaleLinear()
        .domain([
            0,
            d3.max([...allTimeData, ...ligaData, ...nationalTeamData], (d) =>
                Math.max(d.messi, d.ronaldo)
            ),
        ])
        .range([0, contentWidth]);
    yScale = d3
        .scaleBand()
        .domain(yAxisData)
        .range([0, contentHeight])
        .padding(0.2);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    xAxisContainer
        .call(xAxis)
        .attr("transform", `translate(0, ${contentHeight})`);
    yAxisContainer.call(yAxis);

    renderData(allTimeData);
};

initRender();

const allTimeBtn = document.getElementById("allTime");
const ligaBtn = document.getElementById("liga");
const nationalTeamBtn = document.getElementById("nationalTeam");
allTimeBtn.addEventListener("click", () => {
    title.text("Messi vs Ronaldo La All Time");
    renderData(allTimeData);
});
ligaBtn.addEventListener("click", () => {
    title.text("Messi vs Ronaldo La Liga");
    renderData(ligaData);
});
nationalTeamBtn.addEventListener("click", () => {
    title.text("Messi vs Ronaldo National Team");
    renderData(nationalTeamData);
});
