import { Component, Injector, OnInit } from '@angular/core';

import { AppAuthService } from '@shared/auth/app-auth.service';
import { AppComponentBase } from '@shared/app-component-base';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends AppComponentBase implements OnInit {

  constructor(injector: Injector, private _authService: AppAuthService, private router: Router, private titleService: Title) {
    super(injector);
  }

  ngOnInit() {
    console.log(this.appSession.user)
  }

  logout(): void {
    this._authService.logout();
    }

    changePassword() {
        this.router.navigate(["/app/change-password/index"]);
    }
}
