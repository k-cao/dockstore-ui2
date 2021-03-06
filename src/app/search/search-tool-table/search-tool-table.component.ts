import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { DateService } from '../../shared/date.service';
import { AppTool, DockstoreTool } from '../../shared/swagger';
import { SearchEntryTable } from '../search-entry-table';
import { SearchQuery } from '../state/search.query';
import { SearchService } from '../state/search.service';

/**
 * this component refers to search page not tool listing search
 */

@Component({
  selector: 'app-search-tool-table',
  templateUrl: './search-tool-table.component.html',
  styleUrls: ['../../shared/styles/entry-table.scss', './search-tool-table.component.scss'],
})
export class SearchToolTableComponent extends SearchEntryTable implements OnInit {
  readonly entryType = 'tool';
  public dataSource: MatTableDataSource<DockstoreTool | AppTool>;
  constructor(dateService: DateService, searchQuery: SearchQuery, searchService: SearchService) {
    super(dateService, searchQuery, searchService);
  }

  privateNgOnInit(): Observable<Array<DockstoreTool> | Array<AppTool>> {
    return this.searchQuery.tools$;
  }
}
