import { Inject, Injectable} from '@angular/core';
import { HttpClient,  HttpHeaders } from '@angular/common/http';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { Observable, Subject } from 'rxjs';


const oAuthConfig: AuthConfig = {

  // Url of the Identity Provider
  issuer: 'https://accounts.google.com',

  // turn off validation that discovery document endpoints start with the issuer url defined above
  strictDiscoveryDocumentValidation: false,

  // URL of the client to redirect the user to after login
  redirectUri: window.location.origin,

  // The client is registerd with this id at the auth-server
  clientId: '363872105135-je58orlsuursvu6p04lj6j8rvplp8sm0.apps.googleusercontent.com',

  // set the scope for the permissions the client should request
  scope: 'openid profile email https://www.googleapis.com/auth/gmail.readonly'

}

export interface UserInfo{
  info: {
    sub :string,
    email:string,
    name:string
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {

  gmail = "https://gmail.googleapis.com"

  userProfileSubject = new Subject<UserInfo>()
 
  constructor( private httpClient: HttpClient, 
    private readonly oAuthService: OAuthService) { 
    oAuthService.configure(oAuthConfig)
    oAuthService.logoutUrl = "https://www.google.com/accounts/Logout"
    oAuthService.loadDiscoveryDocument().then (() => {
      oAuthService.tryLoginImplicitFlow().then (() => {
        if(!oAuthService.hasValidAccessToken()){
          oAuthService.initLoginFlow()
        }else{
          oAuthService.loadUserProfile().then ((userProfile) => {
            this.userProfileSubject.next (userProfile as UserInfo)
          })
        }
      })
    })

  }

  emails(userId: string): Observable<any> {
      return this.httpClient.get(`${this.gmail}/gmail/v1/users/${userId}/messages`,
      { headers: this.authHeader()})

  }

  getMail(userId: string, mailId: string): Observable<any> {
    return this.httpClient.get(`${this.gmail}/gmail/v1/users/${userId}/messages/${mailId}`,
    { headers: this.authHeader()})

} 
  isLoggedIn(): boolean{
    return this.oAuthService.hasValidAccessToken()
  }

  signOut(){
    this.oAuthService.logOut()
  }

  private authHeader(): HttpHeaders{
    return new HttpHeaders({
      'Authorization' : `Bearer ${this.oAuthService.getAccessToken()}`
    })

  } 

 
}