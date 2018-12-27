
<template>
  <div>
    <table>
      <thead>
        <td v-for="(name, index) of weekHeader" :key="index">{{ name }}</td>
      </thead>
      <tbody>
        <tr v-for="(week,index) of weekArray" :key="index">
          <td :key="index" v-for="(date,index) of week">
            <span
              @click.stop="dateClicked(date.year,date.month,date.numDate)"
              @keyup.space.prevent="dateClicked(date.year,date.month,date.numDate)"
              @keydown.right.prevent="focusTargetDayElement(date.year,date.month,date.numDate+1)"
              @keydown.left.prevent="focusTargetDayElement(date.year,date.month,date.numDate-1)"
              @keydown.up.prevent="focusTargetDayElement(date.year,date.month,date.numDate-7)"
              @keydown.down.prevent="focusTargetDayElement(date.year,date.month,date.numDate+7)"
              :title="getHolidayName(date.year,date.month,date.numDate)"
              :class="{ current:date.month == month, 
                         prev:date.month < month, 
                         next:date.month > month,
                         sun: date.day==0,
                         sat: date.day==6,
                         holiday: getHolidayName(date.year,date.month,date.numDate) }"
              :tabindex="date.month == month?0:-1"
              :ref="`cell${date.year}-${date.month}-${date.numDate}`"
            >
              <span
                class="checkmark"
                :class="{ marked:isChecked(date.year,date.month,date.numDate)}"
              ></span>
              {{ date.numDate }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script lang="ts">
import { Component, Emit, Inject, Model, Prop, Provide, Vue, Watch } from 'vue-property-decorator';
import { createCalendarUnitArray, createCalendarHeader } from '../lib/monthCalendarGenerator';

@Component({})
export default class CheckCalendar extends Vue {
  dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  @Prop({ required: true }) year!: number;
  @Prop({ required: true }) month!: number;
  @Prop({ default: 0 }) shift!: number;
  @Prop({ default: new Array() }) value!: Array<Date>;
  @Prop({ type: Function }) getHolidayNameFunc!: (
    year: number,
    month: number,
    numDate: number
  ) => string;
  @Emit()
  input(newValue: Array<Date>): void {}

  getHolidayName(year: number, month: number, numDate: number): string {
    return this.getHolidayNameFunc ? this.getHolidayNameFunc(year, month, numDate) : '';
  }

  isChecked(year: number, month: number, numDate: number): Boolean {
    return (
      this.value &&
      this.value.some(
        date =>
          date.getFullYear() == year && date.getMonth() + 1 == month && date.getDate() == numDate
      )
    );
  }

  private focusTargetDayElement(year: number, month: number, numDate: number) {
    let target = new Date(year, month - 1, numDate);
    let key = `cell${target.getFullYear()}-${target.getMonth() + 1}-${target.getDate()}`;
    if (this.month == target.getMonth() + 1 && this.year == target.getFullYear())
      ((this.$refs[key] as Element[])[0] as HTMLElement).focus();
  }

  get weekHeader() {
    // なぜかthis.shiftが文字列として解釈されるので /1で数字に戻す
    return this.dayNames.map((value, i, arr) => arr[(this.shift / 1 + i) % 7]);
  }

  get weekArray() {
    return createCalendarUnitArray(this.year, this.month, this.shift);
  }

  dateClicked(year: number, month: number, numDate: number) {
    if (this.year != year || this.month != month) return;
    let newValue = this.value
      .filter(date => date.getFullYear() == year && date.getMonth() + 1 == month)
      .filter(date => date.getDate() != numDate);
    let exists = this.value.length != newValue.length;
    if (!exists) newValue.push(new Date(year, month - 1, numDate));
    this.input(newValue);
  }
}
</script>
<style lang="stylus" scoped>

text-primary = #666666;
text-sun = #e16745;
text-sat = #00a0dd;
text-disabled = #dddddd;
marked-color = #b5b5b5;
material-ease = cubic-bezier(0.165, 0.84, 0.44, 1);

.checkmark {
  position: absolute;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  z-index: -1;
  transform: rotate(-45deg);

  &:before, &:after {
    position: absolute;
    content: '';
    background-color: rgba(250, 150, 150, 1);
    transition: 0.4s material-ease;
    transform: scale(0, 0);
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
  }

  &:before {
    width: 50%;
    height: 6%;
  }

  &:after {
    width: 6%;
    height: 50%;
  }
}

.marked:before, .marked:after {
  transform: scale(1, 1);
}

table {
  border-collapse: collapse;
  position: relative;
  z-index: 0;

  thead > td {
    text-align: center;
    vertical-align: middle;
    width: 3em;
    height: 3em;
    color: text-primary;
    position: relative;
  }

  td > span {
    text-align: center;
    vertical-align: middle;
    width: 3em;
    height: 3em;
    color: text-primary;
    position: relative;
    display: table-cell;

    &:focus {
      outline: 0;
    }

    &:selection {
      background-color: #eeeeee;
    }

    &.sun, &.holiday {
      color: text-sun;
    }

    &.sat {
      color: text-sat;
    }

    &.next, &.prev {
      color: text-disabled;
    }

    &.current {
      cursor: pointer;
    }

    &:after {
      position: absolute;
      left: 0;
      top: 0;
      border-radius: 50%;
      border: 1.5em solid #eeeeee;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      content: '';
      opacity: 0;
      transform: scale(0, 0);
      z-index: -2;
    }

    &.current:focus:after {
      opacity: 0.8;
      transition: 0;
      transform: scale(0.6, 0.6);
    }

    &.current:hover:after {
      opacity: 1;
      transition: 0.3s material-ease;
      transform: scale(1, 1);
    }
  }
}
</style>