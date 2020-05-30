import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sliceAddress',
})
export class SliceAddressPipe implements PipeTransform {

  transform(value: string, length) {
    if(value){
      let data:any=value.substring(0,length);
      if(value.toString().length > length){
        data+='...';
      }
      return data;
    }else{
      return value;
    }
  }
}
