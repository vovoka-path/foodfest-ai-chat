import { Injectable } from '@nestjs/common';
import TurndownService from 'turndown';

@Injectable()
export class SanitizerService {
  private readonly turndownService: TurndownService;

  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });
  }

  htmlToMarkdown(htmlContent: string): string {
    const contentWithLineBreaks = htmlContent.replace(/<br\s*\/?>/gi, '\n');
    return this.turndownService.turndown(contentWithLineBreaks);
  }
}
