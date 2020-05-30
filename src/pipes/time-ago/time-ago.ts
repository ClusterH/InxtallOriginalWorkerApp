import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'timeAgo',
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: string, ...args) {
    if(value){
      return  moment(value,'YYYY-MM-DD HH:mm').fromNow();
    }else{
      return ' ';
    }
  }
}
