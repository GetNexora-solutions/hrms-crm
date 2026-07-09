import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-hrms-crm';

export interface OfferTokenPayload {
  candidateId: string;
  jobId: string;
  purpose: 'offer_acceptance';
  ctc?: number;
  doj?: string;
}

export class TokenService {
  /**
   * Generates a single-use secure token for offer acceptance.
   */
  generateOfferToken(candidateId: string, jobId: string, ctc?: number, doj?: string): string {
    return jwt.sign(
      { candidateId, jobId, purpose: 'offer_acceptance', ctc, doj },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Verifies the offer token and returns the payload.
   */
  verifyOfferToken(token: string): OfferTokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as OfferTokenPayload;
      if (decoded.purpose !== 'offer_acceptance') return null;
      return decoded;
    } catch (err) {
      console.error('Invalid or expired offer token', err);
      return null;
    }
  }
}

export const tokenService = new TokenService();
