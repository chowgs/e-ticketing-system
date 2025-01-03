import { Component } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {
  keyword!: any;

  table_data: any[] = [];

  constructor(
    private route: ActivatedRoute
  ){
    this.route.params.subscribe((param: any) =>{
      this.keyword = param['keyword'];
      this.load_results(this.keyword);
    });
  }

  load_results(keyword: any){
    console.log('finding results');
    console.log(this.table_data);
    
  }


}
