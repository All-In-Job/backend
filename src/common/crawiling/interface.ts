import {
    Community,
    Competition,
    ExamSchedule,
    Intern,
    Language,
    Outside,
    QNet,
} from '@prisma/client';
import { idType } from '../types';

interface CommonType {
    Dday: string;
    title: string;
    view: number;
    mainImage: string;
    organization: string;
    enterprise: string;
    homePage: string;
    detail: string;
    target: string;
    applicationPeriod: string;
    preferentialTreatment: string;
}

export interface InternType extends CommonType {
    personnel: string;
    region: string;
}

export interface OutsideType extends InternType {
    month: number;
    interests: string;
    field: string;
    region: string;
    benefits: string;
    participationPeriod: string;
}

export interface CompetitionType extends CommonType {
    region: string;
    scale: string;
    benefits: string;
    interests: string;
}

export interface createQNet {
    data: {
        detail: string;
        scheduleInfo: string;
        jmNm: string;
        engJmNm: string;
        instiNm: string;
        implNm: string;
        examSchedules: examSchedule[];
    };
    categoryObj: object;
}

export type Path = {
    path: 'outside' | 'intern' | 'competition' | 'qnet';
};

export type paths = {
    id: idType['id'];
    path: Path['path'] | 'language';
    enterprise: string;
    preferentialTreatment: string;
    region: string;
    field: string;
    interests: string;
    benefits: string;
    month: string;
    target: string;
    mainCategory: string;
    subCategory: string;
    page: string;
    classify: string;
};

export type fidneCrawlingType = paths & { count: string };

export type findeDetailType = {
    path: Path['path'];
    id: string;
};

export type createLinkareerPaths = 'outside' | 'intern' | 'competition';
export type createLanguagePaths = 'language';
export type testType =
    | 'toeic'
    | 'toeicBR'
    | 'toeicSW'
    | 'toeicWT'
    | 'ch'
    | 'jp'
    | 'jpSP';

export type createPaths = {
    path: createLinkareerPaths & createLanguagePaths;
    test: testType;
};

export interface languageDetail {
    turn?: string;
    Dday: string;
    resultDay: string;
    applicationPeriod: string;
}

export interface languagePath {
    test: string;
    classify: string;
    homePage: string;
    dataObj: languageDetail;
}

export type findCrawling =
    | {
          id: string;
          title: string;
          enterprise: string;
          Dday: string;
          mainImage: string;
          applicationPeriod: string;
          view: number;
      }[]
    | Language[]
    | {
          view: number;
          jmNm: string;
          engJmNm: string | null;
          instiNm: string;
          implNm: string;
          examSchedules: ExamSchedule[];
      }[]
    | Community[];

export type findeDetail = Competition | Outside | Intern | Language | QNet;

export type createCrawiling = Competition | Outside | Intern;

export type itmeType = {
    jmCd: string;
    jmNm: string;
    engJmNm: string;
    instiNm: string;
    implNm: string;
    mdobligFldNm: string;
    obligfldnm: string;
    jmcd: string;
    mdobligfldnm: string;
};

export type examSchedule = {
    turn: string;
    wtReceipt: string;
    wtDday: string;
    wtResultDay: string;
    ptReceipt: string;
    ptDday: string;
    resultDay: string;
};
