import { Community } from '@prisma/client';
import { idType } from '../types';

interface CommonType {
    Dday: string;
    title: string;
    view: number;
    mainImage: string;
    organization: string;
    institution: string;
    homePage: string;
    detail: string;
    target: string;
    date: string;
    preferentialTreatment: string;
}

export interface InternType extends CommonType {
    personnel: string;
    location: string;
}

export interface OutsideType extends InternType {
    month: number;
    interests: string;
    field: string;
    location: string;
    benefits: string;
    participationPeriod: string;
}

export interface CompetitionType extends CommonType {
    location: string;
    scale: string;
    benefits: string;
    interests: string;
}

export interface createQNet {
    data: {
        detail: string;
        scheduleInfo: string;
        title: string;
        enTitle: string;
        relatedDepartment: string;
        institution: string;
        scrap: number;
        view: number;
        examSchedules: examSchedule[];
    };
    categoryObj: object;
}

export type Path = {
    path: 'outside' | 'intern' | 'competition' | 'qnet';
};

export type paths = {
    path: Path['path'] | 'language';
    institution: string;
    preferentialTreatment: string;
    location: string;
    field: string;
    interests: string;
    benefits: string;
    month: string;
    target: string;
    mainCategory: string;
    subCategory: string;
    page: string;
    classify: string;
    count: string;
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
    date: string;
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
          institution: string;
          Dday: string;
          mainImage: string;
          date: string;
          view: number;
      }[]
    | object[]
    | {
          view: number;
          jmNm: string;
          engJmNm: string | null;
          instiNm: string;
          implNm: string;
          examSchedules: object[];
      }[]
    | Community[];

// export type findeDetail = Competition | Outside | Intern | Language | QNet;

// export type createCrawiling = Competition | Outside | Intern;

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
