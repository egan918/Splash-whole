import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { APP_ENDPOINT } from '../../constants';
// import serviceAPI from "../services/serviceAPI";

import {
  Steps,
  Row,
  Button,
  Upload,
  Col,
  Input,
  Statistic,
  Slider,
  Spin,
  InputNumber,
  Form,
  Typography,
  Card,
  Space,
  Table,
  Tag,
  notification,
} from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import type { TableRowSelection } from 'antd/lib/table/interface';
const { Column, ColumnGroup } = Table;

interface DataType {
  key: React.Key;
  address: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Wallet Address',
    dataIndex: 'address',
  },
];

export const WhiteList = () => {
  const history = useHistory();
  const [data, setData] = useState<DataType[]>([]);
  const { connected, publicKey, disconnect } = useWallet();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [memberAddress, setMemberAddress] = useState('');

  useEffect(() => {
    if (publicKey) {
      const storeOwner = process.env.NEXT_PUBLIC_STORE_OWNER_ADDRESS;
      console.log({ storeOwner });
      console.log(publicKey.toBase58());
      if (storeOwner != publicKey.toBase58()) {
        history.push('/');
      }
    }
  }, [connected, publicKey]);
  // mongodb+srv://Robin:akimoteakira@cluster0.5wwuzix.mongodb.net/?retryWrites=true&w=majority
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const all = await axios.get(APP_ENDPOINT + '/whitelist/all');
    const tempData: DataType[] = [];
    for (var i = 0; i < all.data.length; i++) {
      tempData.push({ key: i, address: all.data[i].address });
    }
    setData(tempData);
  };

  const onSelectChange = newSelectedRowKeys => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  const handleAdd = async () => {
    if (memberAddress != '') {
      try {
        const memberWallet = new PublicKey(memberAddress);
        console.log(PublicKey.isOnCurve(memberWallet.toBytes()));
      } catch (e) {
        notification.warning({
          message: 'Please input valid member address.',
          description: `You should input valid artist Address. it must be matched to PublicKey format`,
          className: 'notification-container',
          placement: 'bottomLeft',
        });
        return;
      }

      const result = await axios.post(APP_ENDPOINT + '/whitelist/add', {
        address: memberAddress,
      });
      if (result.data == 'exists') {
        notification.warning({
          message: 'This member already exists.',
          description: `The member address you inputed already exists`,
          className: 'notification-container',
          placement: 'bottomLeft',
        });
      } else {
        notification.warning({
          message: 'Successfully added to whitelist.',
          description: `The member address you inputed successfully added to whitelist`,
          className: 'notification-container',
          placement: 'bottomLeft',
        });
        setData([...data, { key: data.length, address: memberAddress }]);
        setMemberAddress('');
      }
      console.log(result.data);
    } else {
      notification.warning({
        message: 'Please input whitelist member address.',
        description: `You should input valid artist Address. it must be matched to PublicKey format`,
        className: 'notification-container',
        placement: 'bottomLeft',
      });
      return;
    }
  };

  const handleDelete = async () => {
    if (selectedRowKeys.length == 0) return;
    const addresses: string[] = [];
    for (var i = 0; i < selectedRowKeys.length; i++) {
      addresses.push(data[selectedRowKeys[i]].address);
    }
    const result = await axios.post(APP_ENDPOINT + '/whitelist/delete', {
      addresses: addresses,
    });
    if (result.data) {
      notification.warning({
        message: 'Deleted successfully.',
        description: `The addresses you checked deleted successfully`,
        className: 'notification-container',
        placement: 'bottomLeft',
      });
      fetchData();
    }
  };

  return (
    <>
      <Row className="content-action" justify="center">
        <Col style={{ width: '60%' }}>
          <h3 className="field-title">Manage WhiteList Address</h3>
          <Input
            allowClear
            className="input"
            placeholder="e.g. 2WTHQRkPhTdurbjrjRrH9mbNxfrRSj2wQsNiuTJhGdLb"
            maxLength={150}
            value={memberAddress}
            onChange={info => {
              setMemberAddress(info.target.value);
            }}
          />
          <Row style={{ margin: '5px', gap: '5px', float: 'right' }}>
            <Button type="dashed" onClick={handleAdd}>
              Add
            </Button>
            <Button type="primary" onClick={handleDelete}>
              Delete
            </Button>
          </Row>
          <Table
            // style={{ color: 'white', backgroundColor: 'black' }}
            className="artist-whitelist-table"
            rowSelection={rowSelection}
            columns={columns}
            dataSource={data}
          />
        </Col>
      </Row>
    </>
  );
};
