import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Menu, Modal } from 'antd';
import { useWallet } from '@solana/wallet-adapter-react';
import { Notifications } from '../Notifications';
import useWindowDimensions from '../../utils/layout';
import { MenuOutlined } from '@ant-design/icons';
import { HowToBuyModal } from '../HowToBuyModal';
import {
  Cog,
  CurrentUserBadge,
  CurrentUserBadgeMobile,
} from '../CurrentUserBadge';
import { ConnectButton } from '@oyster/common';
import { MobileNavbar } from '../MobileNavbar';

const getDefaultLinkActions = (connected: boolean) => {
  return [
    <Link to={`/`} key={'explore'}>
      <Button className="app-btn">Explore</Button>
    </Link>,
    <Link to={`/artworks`} key={'artwork'}>
      <Button className="app-btn">{connected ? 'My Items' : 'Artwork'}</Button>
    </Link>,
    <Link to={`/artists`} key={'artists'}>
      <Button className="app-btn">Creators</Button>
    </Link>,
  ];
};

const DefaultActions = ({ vertical = false }: { vertical?: boolean }) => {
  const { connected } = useWallet();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
      }}
    >
      {getDefaultLinkActions(connected)}
    </div>
  );
};

export const MetaplexMenu = () => {
  const { width } = useWindowDimensions();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const { connected } = useWallet();

  if (width < 768)
    return (
      <>
        <Modal
          title={<img src={'/metaplex-logo.svg'} />}
          visible={isModalVisible}
          footer={null}
          className={'modal-box'}
          closeIcon={
            <img
              onClick={() => setIsModalVisible(false)}
              src={'/modals/close.svg'}
            />
          }
        >
          <div className="site-card-wrapper mobile-menu-modal">
            <Menu onClick={() => setIsModalVisible(false)}>
              {getDefaultLinkActions(connected).map((item, idx) => (
                <Menu.Item key={idx}>{item}</Menu.Item>
              ))}
            </Menu>
            <div className="actions">
              {!connected ? (
                <div className="actions-buttons">
                  <ConnectButton
                    onClick={() => setIsModalVisible(false)}
                    className="secondary-btn"
                  />
                  <HowToBuyModal
                    onClick={() => setIsModalVisible(false)}
                    buttonClassName="black-btn"
                  />
                </div>
              ) : (
                <>
                  <CurrentUserBadgeMobile
                    showBalance={false}
                    showAddress={true}
                    iconSize={24}
                    closeModal={() => {
                      setIsModalVisible(false);
                    }}
                  />
                  <Notifications />
                  <Cog />
                </>
              )}
            </div>
          </div>
        </Modal>
        <MenuOutlined
          onClick={() => setIsModalVisible(true)}
          style={{ fontSize: '1.4rem' }}
        />
      </>
    );

  return <DefaultActions />;
};

export const LogoLink = () => {
  return (
    <Link to={`/`}>
      <span style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>
        SPLASH BACKSTAGE
      </span>
    </Link>
  );
};

export const AppBar = () => {
  const { connected, publicKey, disconnect } = useWallet();
  const [isStoreOwner, setIsStoreOwner] = useState(false);

  useEffect(() => {
    if (publicKey) {
      const storeOwner = process.env.NEXT_PUBLIC_STORE_OWNER_ADDRESS;
      console.log({ storeOwner });
      console.log(publicKey.toBase58());
      if (storeOwner == publicKey.toBase58()) setIsStoreOwner(true);
      else setIsStoreOwner(false);
    }
  }, [connected, publicKey]);

  return (
    <>
      {/* <MobileNavbar /> */}
      <div id="desktop-navbar" style={{ padding: '20px' }}>
        <div className="app-left">
          <LogoLink />
          &nbsp;&nbsp;&nbsp;
          {/* <MetaplexMenu /> */}
        </div>
        <div className="app-right">
          {/* {!connected && (
            <HowToBuyModal buttonClassName="modal-button-default" />
          )} */}
          {!connected && (
            <ConnectButton style={{ height: 48 }} allowWalletChange />
          )}
          {connected && (
            <>
              {/* <CurrentUserBadge
                showBalance={false}
                showAddress={true}
                iconSize={24}
              /> */}
              {/* <Notifications /> */}
              {/* <Cog /> */}
              <Button className="connector" onClick={() => disconnect()}>
                Disconnect
              </Button>
              <Link to={`/create`}>
                <Button className="connector">Create</Button>
              </Link>
            </>
          )}
          {connected && isStoreOwner && (
            <Link to={`/whitelist`}>
              <Button className="connector">WhiteList</Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};
