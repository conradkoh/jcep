# Royal Rangers Terminology

Canonical names and abbreviations used in the JCEP application.

## Organisation

| Abbreviation | Full Name     |
| ------------ | ------------- |
| RR           | Royal Rangers |

## Age Groups

Age groups are the programme levels Junior Commanders progress through. Stored values in the database use the abbreviation codes below.

| Code | Full Name          | Notes                        |
| ---- | ------------------ | ---------------------------- |
| RK   | Ranger Kids        |                              |
| DR   | Discovery Rangers  |                              |
| AR   | Adventure Rangers  | Parent group for ARB and ARG |
| ER   | Expedition Rangers |                              |

### Adventure Rangers Subgroups

Adventure Rangers (AR) is sometimes split by gender in programme materials:

| Code | Full Name                 |
| ---- | ------------------------- |
| ARB  | Adventure Rangers (Boys)  |
| ARG  | Adventure Rangers (Girls) |

> **Note:** The application stores `AR` as the age group value. ARB/ARG are documented for domain clarity only.

## Usage in Code

- UI labels: `apps/webapp/src/modules/review/utils/ageGroupLabels.ts`
- Type: `AgeGroup = 'RK' | 'DR' | 'AR' | 'ER'` in `apps/webapp/src/modules/review/types.ts`
