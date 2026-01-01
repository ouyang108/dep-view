<template>
    <div id="dependency-graph" class="w-full ">123</div>
</template>
<script setup lang="ts">
import * as d3 from "d3";

      const packageData:any = {
      'element-plus': {
        name: 'element-plus',
        currentVersion: '2.3.14',
        latestVersion: '2.4.2',
        status: 'update',
        updateContent: [
          '修复Table组件排序功能异常问题',
          '优化Select组件下拉性能',
          '新增DatePicker组件快捷选择功能',
          '更新依赖lodash至4.17.21版本'
        ],
        deps: [
          { name: 'lodash', version: '4.17.20', latest: '4.17.21', status: 'update', deps: [{ name: '@types/lodash', version: '4.14.195', status: 'latest' }] },
          { name: '@vue/shared', version: '3.3.4', latest: '3.3.4', status: 'latest', deps: [] },
          { name: 'async-validator', version: '4.2.5', latest: '4.2.5', status: 'latest', deps: [{ name: '@types/async-validator', version: '4.0.0', status: 'latest' }] },
          { name: 'vue', version: '3.3.4', latest: '3.3.8', status: 'update', deps: [] }
        ]
      },
      'vue': {
        name: 'vue',
        currentVersion: '3.3.8',
        latestVersion: '3.3.8',
        status: 'latest',
        updateContent: [],
        deps: [
          { name: '@vue/compiler-dom', version: '3.3.8', latest: '3.3.8', status: 'latest', deps: [] },
          { name: '@vue/compiler-sfc', version: '3.3.8', latest: '3.3.8', status: 'latest', deps: [] },
          { name: '@vue/runtime-dom', version: '3.3.8', latest: '3.3.8', status: 'latest', deps: [] }
        ]
      },
      'axios': {
        name: 'axios',
        currentVersion: '1.4.0',
        latestVersion: '1.6.0',
        status: 'error',
        updateContent: [
          '修复请求头注入安全漏洞',
          '优化错误处理逻辑',
          '更新follow-redirects依赖版本'
        ],
        deps: [
          { name: 'follow-redirects', version: '1.15.0', latest: '1.15.0', status: 'error', deps: [] },
          { name: 'form-data', version: '4.0.0', latest: '4.0.0', status: 'latest', deps: [] }
        ]
      }
    };
function initDependencyGraph() {
    console.log(111111)
      // 构造图数据
      const graphData = {
        nodes: [],
        links: []
      };

      // 添加主包节点
      Object.keys(packageData).forEach(pkgName => {
        const pkg = packageData[pkgName];
        graphData.nodes.push({
          id: pkgName,
          name: pkg.name,
          version: pkg.currentVersion,
          latest: pkg.latestVersion,
          status: pkg.status,
          type: 'main'
        });

        // 添加依赖节点和连线
        pkg.deps.forEach(dep => {
          const depId = `${pkgName}-${dep.name}`;
          // 检查节点是否已存在
          if (!graphData.nodes.some(n => n.id === dep.name)) {
            graphData.nodes.push({
              id: dep.name,
              name: dep.name,
              version: dep.version,
              latest: dep.latest || dep.version,
              status: dep.status,
              type: 'dependency'
            });
          }
          // 添加连线
          graphData.links.push({ source: pkgName, target: dep.name });

          // 添加二级依赖
          dep.deps.forEach(subDep => {
            const subDepId = `${dep.name}-${subDep.name}`;
            if (!graphData.nodes.some(n => n.id === subDep.name)) {
              graphData.nodes.push({
                id: subDep.name,
                name: subDep.name,
                version: subDep.version,
                latest: subDep.version,
                status: subDep.status,
                type: 'dependency'
              });
            }
            graphData.links.push({ source: dep.name, target: subDep.name });
          });
        });
      });

      // 隐藏加载提示
      setTimeout(() => {
      
        
        const container = document.getElementById('dependency-graph')!;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // 创建SVG
        const svg = d3.select('#dependency-graph')
          .append('svg')
          .attr('width', '100%')
          .attr('height',window.innerHeight);

        // 创建缩放行为
        const zoom = d3.zoom()
          .scaleExtent([0.5, 3])
          .on('zoom', (event) => {
            g.attr('transform', event.transform);
          });

        svg.call(zoom);

        // 创建分组用于缩放
        const g = svg.append('g')
          .attr('class', 'graph-container');

        // 定义颜色
        const color = d => {
          if (d.status === 'error') return '#EF4444';
          if (d.status === 'update') return '#F59E0B';
          if (d.type === 'main') return '#4F46E5';
          return '#9CA3AF'; // neutral-400
        };

        // 创建力导向图
        const simulation = d3.forceSimulation(graphData.nodes)
          .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(100))
          .force('charge', d3.forceManyBody().strength(-300))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collision', d3.forceCollide().radius(50));

        // 绘制连接线
        const link = g.append('g')
          .selectAll('line')
          .data(graphData.links)
          .enter().append('line')
          .attr('stroke', '#D1D5DB') // neutral-300
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.6);

        // 创建节点组
        const node = g.append('g')
          .selectAll('.node')
          .data(graphData.nodes)
          .enter().append('g')
          .attr('class', 'node')
          .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded));

        // 绘制节点圆圈
        node.append('circle')
          .attr('r', d => d.type === 'main' ? 20 : 15)
          .attr('fill', color)
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', 2)
          .attr('cursor', 'move');

        // 添加节点文本
        node.append('text')
          .attr('dy', 4)
          .attr('text-anchor', 'middle')
          .text(d => {
            // 截断长名称
            const name = d.name.length > 8 ? d.name.substring(0, 8) + '...' : d.name;
            return name;
          })
          .attr('font-size', d => d.type === 'main' ? 12 : 10)
          .attr('fill', '#FFFFFF')
          .attr('font-weight', '500');

        // 添加版本信息提示
        node.append('title')
          .text(d => `${d.name}\n当前版本: ${d.version}\n最新版本: ${d.latest}\n状态: ${
            d.status === 'error' ? '有问题' : d.status === 'update' ? '有更新' : '最新版本'
          }`);

        // 更新力导向图
        simulation.on('tick', () => {
          link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

          node
            .attr('transform', d => `translate(${d.x},${d.y})`);
        });

        // 节点交互效果
        node.on('mouseover', function(event, d) {
          // 高亮当前节点
          d3.select(this).select('circle').classed('node-hover', true);
          
          // 高亮相关连线
          link.filter(l => l.source.id === d.id || l.target.id === d.id)
            .classed('edge-highlight', true);
        })
        .on('mouseout', function() {
          // 移除高亮
          d3.select(this).select('circle').classed('node-hover', false);
          link.classed('edge-highlight', false);
        });

        // 拖拽函数
        function dragStarted(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(event, d) {
          d.fx = event.x;
          d.fy = event.y;
        }

        function dragEnded(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

        // 暴露缩放函数到全局
        window.zoomIn = () => {
          svg.transition().call(zoom.scaleBy, 1.2);
        };

        window.zoomOut = () => {
          svg.transition().call(zoom.scaleBy, 0.8);
        };

        window.resetZoom = () => {
          svg.transition().call(zoom.transform, d3.zoomIdentity);
        };
      }, 800);
    }
onMounted(() => {
    initDependencyGraph()
    console.log(window.innerHeight)
})
</script>
<style lang='scss' scoped></style>