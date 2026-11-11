// Must match SPORTS in the backend (src/shared/constants.js).
export const SPORTS = [
  "Football",
  "Rugby",
  "Basketball",
  "Netball",
  "Volleyball",
  "Handball",
  "Hockey",
  "Cricket",
  "Athletics",
  "Swimming",
  "Tennis",
  "Boxing",
  "Cycling",
  "Golf",
  "Martial arts",
  "Multi-sport",
  "Other",
] as const;

const COUNTRY_CODES =
  "AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW".split(
    " ",
  );

export function countryName(code?: string | null): string {
  if (!code) return "";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

export function countryOptions(): { code: string; name: string }[] {
  return COUNTRY_CODES.map((code) => ({ code, name: countryName(code) })).sort(
    (a, b) => a.name.localeCompare(b.name),
  );
}

// How a request's status is shown to a team.
export const STATUS_LABELS: Record<string, string> = {
  new: "Submitted",
  in_review: "In review",
  quoted: "Quoted",
  confirmed: "Approved",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Not approved",
};

export const STATUS_STYLES: Record<string, string> = {
  new: "bg-[#f0e9fb] text-[#7650ab]",
  in_review: "bg-[#e8f4fb] text-[#007cc2]",
  quoted: "bg-[#fff4dc] text-[#a36a00]",
  confirmed: "bg-[#eaf5ee] text-[#1c673e]",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-slate-100 text-slate-500",
  rejected: "bg-red-50 text-red-700",
};

// A team may cancel its own request only in these statuses.
export const CANCELLABLE_STATUSES = ["new", "in_review", "quoted"];
