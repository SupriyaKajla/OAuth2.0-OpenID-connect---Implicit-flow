import { Component } from '@angular/core';
import { GoogleApiService, UserInfo } from './google-api.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'oauthApp';

  mailSnippets: string[] = []
  userInfo?: UserInfo

  constructor( private readonly googleApi: GoogleApiService){
    googleApi.userProfileSubject.subscribe(info => {
      this.userInfo = info
    })
    
  }
  
  isLoggedIn(): boolean {
    return this.googleApi.isLoggedIn()
  }

  logout(){
    this.googleApi.signOut()
  }

  async getEmails() {
    if (!this.userInfo) {
      return;
    }
    const userId = this.userInfo?.info.sub as string
    const messages = await lastValueFrom(this.googleApi.emails(userId))
    messages.messages.forEach( (element: any) => {
      const mail = lastValueFrom(this.googleApi.getMail(userId, element.id))
      mail.then( mail => {
        this.mailSnippets.push(mail.snippet)
      })
    });
  }
 
}

