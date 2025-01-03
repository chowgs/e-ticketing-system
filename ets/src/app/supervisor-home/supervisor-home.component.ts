import { Component, OnInit } from '@angular/core';
import { SupervisorService } from '../services/supervisor.service';
import {  } from '@angular/router';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-supervisor-home',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './supervisor-home.component.html',
  styleUrls: ['./supervisor-home.component.css']
})
export class SupervisorHomeComponent {

}

