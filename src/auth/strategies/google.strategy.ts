import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env
    if (!GOOGLE_CALLBACK_URL || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error();
    }
    super({

      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const user = {
      provider: 'google',
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      displayName: profile.displayName,
      name: profile.name,
      photos: profile.photos,
    };
    return done(null, user);
  }

  async authorizationParams(): Promise<{ prompt: string }> {
    return {
      prompt: 'select_account',
    };
  }
}


