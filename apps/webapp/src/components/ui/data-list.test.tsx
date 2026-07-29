import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  DataList,
  DataListField,
  DataListItem,
  DataListItemFooter,
  DataListItemHeader,
} from './data-list';

describe('DataList', () => {
  it('renders a list item with header, fields, and footer', () => {
    render(
      <DataList>
        <DataListItem>
          <DataListItemHeader title="Alice Tan">
            <span>Active</span>
          </DataListItemHeader>
          <DataListField label="Age Group">JC1</DataListField>
          <DataListItemFooter>
            <button type="button">Action</button>
          </DataListItemFooter>
        </DataListItem>
      </DataList>
    );

    expect(screen.getByText('Alice Tan')).toBeInTheDocument();
    expect(screen.getByText('Age Group')).toBeInTheDocument();
    expect(screen.getByText('JC1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
