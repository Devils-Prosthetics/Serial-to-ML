<script setup lang="ts">
import ApexCharts from 'vue3-apexcharts'
</script>
<template>
  <div class="app">
    <div id="chart">
      <ApexCharts
        type="line"
        height="350"
        ref="chart"
        :options="chartOptions"
        :series="series"
      ></ApexCharts>
    </div>
    <button @click="updateChart">Update!</button>
  </div>
</template>
<script lang="ts">
export default {
  name: 'Chart',
  data(): unknown {
    return {
      chart: {
        id: 'realtime',
        height: 350,
        type: 'line',
        animations: {
          enabled: true,
          easing: 'linear',
          dynamicAnimation: {
            speed: 1000
          }
        },
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      title: {
        text: 'Dynamic Updating Chart',
        align: 'left'
      },
      markers: {
        size: 0
      },
      xaxis: {
        type: 'numeric'
      },
      yaxis: {
        max: 100
      },
      legend: {
        show: false
      }
    }
  },
  methods: {
    updateChart(): void {
      const max = 90
      const min = 20
      const newData = this.series[0].data.map(() => {
        return Math.floor(Math.random() * (max - min + 1)) + min
      })
      // In the same way, update the series option
      this.series = [{
        data: newData
      }]
    }
  }
}

</script>
<!-- <script lang="ts">
export default {
  components: {
    apexchart: VueApexCharts,
  },
  data(): unknown {
    return {
      series: [{
        data: data.slice()
      }],
      chartOptions: {
        chart: {
          id: 'realtime',
          height: 350,
          type: 'line',
          animations: {
            enabled: true,
            easing: 'linear',
            dynamicAnimation: {
              speed: 1000
            }
          },
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth'
        },
        title: {
          text: 'Dynamic Updating Chart',
          align: 'left'
        },
        markers: {
          size: 0
        },
        xaxis: {
          type: 'datetime',
          range: XAXISRANGE,
        },
        yaxis: {
          max: 100
        },
        legend: {
          show: false
        }
      }
    }
  },
  mounted(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const me = this
    window.setInterval(function () {
      getNewSeries(lastDate, {
        min: 10,
        max: 90
      })
      
      me.$refs.chart.updateSeries([{
        data: data
      }])
    }, 1000)
  
    // every 60 seconds, we reset the data to prevent memory leaks
    window.setInterval(function () {
      resetData()
      
      me.$refs.chart.updateSeries([{
        data
      }], false, true)
    }, 60000)
  },
}
</script> -->
