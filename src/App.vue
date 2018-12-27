<template>
  <div id="app">
    <h2>{{ year }}年{{ month }}月</h2>
    <CheckCalendar
      :year="year"
      :month="month"
      shift="1"
      :getHolidayNameFunc="getHolidayName"
      v-model="checkedDates"
    />
    CheckedDates = {{ checkedDates }}
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CheckCalendar from "./components/CheckCalendar.vue";

@Component({
  components: {
    CheckCalendar
  }
})
export default class App extends Vue {
  year = 2018;
  month = 12;
  checkedDates = [new Date(this.year, this.month - 1, 5)];

  getHolidayName(year: number, month: number, numDate: number): string {
    console.log(`getHolidayName called: ${year}-${month}-${numDate}`);
    if (year == 2018 && month == 12 && numDate == 24) {
      return "クリスマスイブ";
    }
    return "";
  }
}
</script>
<style lang="stylus">
#app {
}
</style>
