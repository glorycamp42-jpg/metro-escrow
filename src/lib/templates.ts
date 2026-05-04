/** Standard escrow forms with merge fields. Phase 3 -> backed by DB. */

export type TemplateMeta = {
  slug: string;
  name: string;
  category: "Instructions" | "Disclosure" | "Withholding" | "Title" | "Tax";
  blurb: string;
};

export const TEMPLATES: TemplateMeta[] = [
  {
    slug: "escrow-instructions",
    name: "Joint Escrow Instructions",
    category: "Instructions",
    blurb: "Standard escrow instructions signed by buyer and seller at file open."
  },
  {
    slug: "demand-letter",
    name: "Payoff Demand Request",
    category: "Disclosure",
    blurb: "Sent to existing lender to request payoff figures."
  },
  {
    slug: "statement-of-info",
    name: "Statement of Information",
    category: "Title",
    blurb: "Identity statement required by title insurer."
  },
  {
    slug: "firpta",
    name: "FIRPTA Certification",
    category: "Withholding",
    blurb: "Seller certification of US person status under FIRPTA."
  },
  {
    slug: "ca-593",
    name: "California 593 Withholding",
    category: "Withholding",
    blurb: "Real estate withholding statement for CA Franchise Tax Board."
  },
  {
    slug: "1099-s",
    name: "1099-S Information Return",
    category: "Tax",
    blurb: "Year-end information return for proceeds from real estate transaction."
  }
];

export type MergeFields = {
  fileNumber: string;
  propertyAddress: string;
  city: string;
  state: string;
  zip: string;
  apn?: string;
  closingDate: string;
  price: string;
  buyer: string;
  seller?: string;
  lender?: string;
  title?: string;
  officer: string;
  date: string;
};

export function renderBody(slug: string, m: MergeFields): string {
  const safe = (v: string | undefined, fallback = "_____________") =>
    v && v.trim() ? v : fallback;
  switch (slug) {
    case "escrow-instructions":
      return `These Joint Escrow Instructions are entered into by ${safe(m.buyer)} ("Buyer") and ${safe(m.seller)} ("Seller") in connection with the property located at ${safe(m.propertyAddress)}, ${safe(m.city)}, ${safe(m.state)} ${safe(m.zip)} (APN ${safe(m.apn)}).

Sale price: $${safe(m.price)}. Closing target: ${safe(m.closingDate)}.

Metro Escrow ("Escrow Holder") is hereby instructed to handle the funds, documents, and disbursements of this transaction subject to the terms below. Escrow officer of record: ${safe(m.officer)}.

1. Earnest money deposit shall be held in Escrow Holder's trust account.
2. Title insurance shall be ordered with ${safe(m.title)}.
3. Loan funding shall be received from ${safe(m.lender)} prior to recording.
4. All disbursements shall be made strictly per the final settlement statement.
5. Wire instructions are provided separately and shall be verified by callback before any movement of funds.

Signed at ${safe(m.city)}, ${safe(m.state)} on ${safe(m.date)}.`;

    case "demand-letter":
      return `Date: ${safe(m.date)}
File: ${safe(m.fileNumber)}

To: ${safe(m.lender)}

Re: Payoff demand for property at ${safe(m.propertyAddress)}, ${safe(m.city)}, ${safe(m.state)} ${safe(m.zip)} (APN ${safe(m.apn)}).

We are the escrow holder for the sale of the above-referenced property. Please provide a written payoff demand showing principal, interest, per-diem, and any prepayment penalties effective ${safe(m.closingDate)}.

Wire instructions for the loan payoff will be furnished by Metro Escrow upon receipt of your demand. Please direct your response to ${safe(m.officer)} of Metro Escrow.

Thank you for your prompt cooperation.

${safe(m.officer)}
Metro Escrow`;

    case "statement-of-info":
      return `Statement of Information

File: ${safe(m.fileNumber)}
Property: ${safe(m.propertyAddress)}, ${safe(m.city)}, ${safe(m.state)} ${safe(m.zip)}

Full legal name: ____________________________________________
Other names used (maiden / aliases): ___________________________
Date of birth: ______________  SSN (last 4): ____  Driver license #: __________

Spouse / Domestic partner full legal name: ____________________________
Date of birth: ______________

Address history (last 10 years):
1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

Employment history (last 10 years):
1. ________________________________________________
2. ________________________________________________

I declare under penalty of perjury that the foregoing is true and correct.

Signature: ____________________________ Date: ${safe(m.date)}`;

    case "firpta":
      return `Section 1445 of the Internal Revenue Code provides that a transferee of a U.S. real property interest must withhold tax if the transferor is a foreign person. To inform ${safe(m.buyer)} that withholding of tax is not required upon the disposition of a U.S. real property interest at ${safe(m.propertyAddress)}, the undersigned hereby certifies the following:

1. ${safe(m.seller)} is not a nonresident alien for purposes of U.S. income taxation.
2. ${safe(m.seller)}'s U.S. taxpayer identification number is _______________________.
3. ${safe(m.seller)}'s home address is _______________________.

Under penalty of perjury, I declare that I have examined this certification and to the best of my knowledge and belief it is true, correct and complete.

Signature: ____________________________ Date: ${safe(m.date)}`;

    case "ca-593":
      return `California Real Estate Withholding Statement (Form 593)

File: ${safe(m.fileNumber)}
Property: ${safe(m.propertyAddress)}, ${safe(m.city)}, ${safe(m.state)} ${safe(m.zip)}
Sale price: $${safe(m.price)}
Closing date: ${safe(m.closingDate)}

Seller: ${safe(m.seller)}
Tax ID: _______________________

Withholding amount: ___________ (3 1/3% of sale price unless certification claims an exemption)

Exemption claimed (check one if applicable):
[ ] Principal residence
[ ] Loss or zero gain
[ ] 1031 exchange
[ ] Involuntary conversion

Seller signature: ____________________________ Date: ${safe(m.date)}
Escrow officer: ${safe(m.officer)}`;

    case "1099-s":
      return `Form 1099-S - Proceeds From Real Estate Transactions

Filer: Metro Escrow, Inc.
File number: ${safe(m.fileNumber)}

Transferor (seller): ${safe(m.seller)}
Tax ID: _______________________

Property address: ${safe(m.propertyAddress)}, ${safe(m.city)}, ${safe(m.state)} ${safe(m.zip)}
Date of closing: ${safe(m.closingDate)}
Gross proceeds: $${safe(m.price)}

Buyer's portion of real estate tax: ___________

Prepared by: ${safe(m.officer)} - Metro Escrow
Date prepared: ${safe(m.date)}`;
    default:
      return "Template not found.";
  }
}
