export interface discordUser {
    id: string;
    username: string;
    discriminator: string;
}


export interface discordTokenResponse {
    access_token: string,
    expires_in: number,
    refresh_token: string,
    scope: string,
    token_type: string,
}