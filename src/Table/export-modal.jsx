import React, { useState } from 'react';
import { Form, Modal } from 'semantic-ui-react';
import FileSaver from 'file-saver';

const ExportModal = props => {
  const [formatType, setFormatType] = useState('csv');
  const handleFormatChange = (e, { value }) => setFormatType(value);
  const [fileName, setFileName] = useState('');
  const submit = () => {
    let blobData = JSON.stringify(props.data, null, 2);
    let mimeType = 'application/json;charset=utf-8;';

    if (formatType === 'csv') {
      const columns = props.columns.filter(column => column.show !== false);
      const csv = [];
      csv.push(columns.map(column => column.label).join());

      const rows = props.data.map(row => {
        const rowData = [];
        columns.forEach(column => rowData.push(row[column.key]));
        return rowData.join();
      }).join('\n');

      csv.push(rows);

      blobData = csv.join('\n');
      mimeType = 'text/csv;charset=utf-8;'
    }

    const fileBlob = new Blob([blobData], { type: mimeType });
    FileSaver.saveAs(fileBlob, `${fileName}.${formatType}`);
  }

  return (
    <Modal trigger={props.trigger}>
      <Modal.Header>
        Export Table
      </Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Group inline={true}>
            <Form.Radio
              label='CSV'
              value='csv'
              checked={formatType === 'csv'}
              onChange={handleFormatChange}
            />
            <Form.Radio
              label='JSON'
              value='json'
              checked={formatType === 'json'}
              onChange={handleFormatChange}
            />
          </Form.Group>
          <Form.Input
            label='Filename'
            type='text'
            placeholder='Filename'
            value={fileName}
            onChange={e => setFileName(e.target.value)}
          />
          <Form.Button content='Download' primary={true} onClick={submit}/>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

export default ExportModal;
