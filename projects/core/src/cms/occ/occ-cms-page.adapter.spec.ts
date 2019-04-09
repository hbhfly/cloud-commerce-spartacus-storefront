import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CmsComponent, CMSPage, PageType } from '../../occ/occ-models/index';
import { OccEndpointsService } from '../../occ/services/occ-endpoints.service';
import { PageContext } from '../../routing/index';
import { CmsStructureConfigService } from '../services';
import { OccCmsPageAdapter } from './occ-cms-page.adapter';

const components: CmsComponent[] = [
  { uid: 'comp1', typeCode: 'SimpleBannerComponent' },
  { uid: 'comp2', typeCode: 'CMSLinkComponent' },
  { uid: 'comp3', typeCode: 'NavigationComponent' },
];

const cmsPageData: CMSPage = {
  uid: 'testPageId',
  name: 'testPage',
  template: 'testTemplate',
  contentSlots: {
    contentSlot: [
      { components: { component: components }, position: 'testPosition' },
    ],
  },
};

class CmsStructureConfigServiceMock {}

const endpoint = '/cms';

class OccEndpointsServiceMock {
  getEndpoint(): string {
    return endpoint;
  }
}

fdescribe('OccCmsPageAdapter', () => {
  let service: OccCmsPageAdapter;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OccCmsPageAdapter,
        { provide: OccEndpointsService, useClass: OccEndpointsServiceMock },
        {
          provide: CmsStructureConfigService,
          useClass: CmsStructureConfigServiceMock,
        },
      ],
    });

    service = TestBed.get(OccCmsPageAdapter);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Load cms page data', () => {
    it('Should get cms content page data without parameter fields', () => {
      const context: PageContext = {
        id: 'testPagId',
        type: PageType.CONTENT_PAGE,
      };

      service.load(context).subscribe(result => {
        expect(result).toEqual(cmsPageData);
      });

      const testRequest = httpMock.expectOne(req => {
        return req.method === 'GET' && req.url === endpoint + '/p' + 'ages';
      });

      expect(testRequest.request.params.get('pageLabelOrId')).toEqual(
        'testPagId'
      );

      expect(testRequest.cancelled).toBeFalsy();
      expect(testRequest.request.responseType).toEqual('json');
      testRequest.flush(cmsPageData);
    });

    it('Should get cms content page data with parameter fields', () => {
      const context: PageContext = {
        id: 'testPagId',
        type: PageType.CONTENT_PAGE,
      };

      service.load(context, 'BASIC').subscribe(result => {
        expect(result).toEqual(cmsPageData);
      });

      const testRequest = httpMock.expectOne(req => {
        return req.method === 'GET' && req.url === endpoint + '/pages';
      });

      expect(testRequest.request.params.get('pageLabelOrId')).toEqual(
        'testPagId'
      );
      expect(testRequest.request.params.get('fields')).toEqual('BASIC');

      expect(testRequest.cancelled).toBeFalsy();
      expect(testRequest.request.responseType).toEqual('json');
      testRequest.flush(cmsPageData);
    });

    it('should get cms product page data', () => {
      const context: PageContext = {
        id: '123',
        type: PageType.PRODUCT_PAGE,
      };
      service.load(context).subscribe(result => {
        expect(result).toEqual(cmsPageData);
      });

      const testRequest = httpMock.expectOne(req => {
        return req.method === 'GET' && req.url === endpoint + '/pages';
      });
      expect(testRequest.request.params.get('code')).toEqual('123');

      expect(testRequest.cancelled).toBeFalsy();
      expect(testRequest.request.responseType).toEqual('json');
      testRequest.flush(cmsPageData);
    });
  });
});
