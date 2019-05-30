import { Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';

import { AppComponentBase } from '@shared/app-component-base';
import { LoginService } from './login/login.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthComponent extends AppComponentBase implements OnInit {

  constructor(
    injector: Injector,
    private _loginService: LoginService
  ) {
    super(injector);
  }

    ngOnInit() {
  }

}
