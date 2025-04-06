import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { AuthService } from "./auth.service";

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(GoogleStrategy, "google") {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
      scope: ["email", "profile"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const user = await this.authService.validateOAuthLogin(profile, "google");
    return done(null, user);
  }
}

@Injectable()
export class FacebookAuthStrategy extends PassportStrategy(FacebookStrategy, "facebook") {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/facebook/callback`,
      profileFields: ["id", "emails", "name"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const user = await this.authService.validateOAuthLogin(profile, "facebook");
    return done(null, user);
  }
}

@Injectable()
export class TwitterAuthStrategy extends PassportStrategy(TwitterStrategy, "twitter") {
  constructor(private authService: AuthService) {
    super({
      consumerKey: process.env.TWITTER_CLIENT_ID,
      consumerSecret: process.env.TWITTER_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/twitter/callback`,
      includeEmail: true,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const user = await this.authService.validateOAuthLogin(profile, "twitter");
    return done(null, user);
  }
}

@Injectable()
export class LinkedInAuthStrategy extends PassportStrategy(LinkedInStrategy, "linkedin") {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/linkedin/callback`,
      scope: ["r_emailaddress", "r_liteprofile"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const user = await this.authService.validateOAuthLogin(profile, "linkedin");
    return done(null, user);
  }
}


//JwtStrategy to Support Token Authentication

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId, email: payload.email };
  }
}
