export type AuthJwtPayload = {
    sub: string;
    userId: number;
    userUuid: string;
    email: string;
    villageId: number | null;
    roles: string[];
    permissions: string[];
};

export type CurrentAuthUser = {
    id: number;
    uuid: string;
    email: string;
    village_id: number | null;
    roles?: string[];
    permissions?: string[];
};