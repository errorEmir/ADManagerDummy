const AD_TREE = {
  id: 'root',
  name: 'Active Directory Users and Computers [FOLSECDC.folsec.local]',
  type: 'domain-root',
  icon: 'domain',
  children: [
    {
      id: 'saved-queries',
      name: 'Saved Queries',
      type: 'container',
      icon: 'folder-saved',
      children: []
    },
    {
      id: 'folsec-local',
      name: 'folsec.local',
      type: 'domain',
      icon: 'domain',
      children: [
        { id: 'bayiler',          name: 'Bayiler',                type: 'ou', icon: 'ou', children: [] },
        { id: 'builtin',          name: 'Builtin',                type: 'container', icon: 'folder', children: [] },
        { id: 'computers',        name: 'Computers',              type: 'container', icon: 'folder', children: [] },
        { id: 'disable_users',    name: 'Disable_Users',          type: 'ou', icon: 'ou', children: [] },
        { id: 'domain-ctrl',      name: 'Domain Controllers',     type: 'ou', icon: 'ou', children: [] },
        {
          id: 'folsec-group-create',
          name: 'FolSec_Group_Create_OU',
          type: 'ou', icon: 'ou',
          children: []
        },
        { id: 'folsec-users',     name: 'FolSec_Users',           type: 'ou', icon: 'ou', children: [] },
        { id: 'foreign-sec',      name: 'ForeignSecurityPrincipals', type: 'container', icon: 'folder', children: [] },
        { id: 'lostfound',        name: 'LostAndFound',           type: 'container', icon: 'folder', children: [] },
        { id: 'service-ou',       name: 'Service_OU',             type: 'ou', icon: 'ou', children: [] },
        { id: 'service-accts',    name: 'ServiceAccounts',        type: 'ou', icon: 'ou', children: [] },
        { id: 'stajyer',          name: 'Stajyer',                type: 'ou', icon: 'ou', children: [] },
        { id: 'sunucular',        name: 'Sunucular',              type: 'ou', icon: 'ou', children: [] },
        { id: 'system',           name: 'System',                 type: 'container', icon: 'folder', children: [] },
        { id: 'test-file-share',  name: 'Test_File_Share',        type: 'ou', icon: 'ou', children: [] },
        { id: 'test-group',       name: 'Test_Group',             type: 'ou', icon: 'ou', children: [] },
        { id: 'test-users',       name: 'Test_Users',             type: 'ou', icon: 'ou', children: [] },
        { id: 'users',            name: 'Users',                  type: 'container', icon: 'folder', children: [] },
        { id: 'yazilim-ekibi',    name: 'Yazilim Ekibi_OU',       type: 'ou', icon: 'ou', children: [] },
        { id: 'yurtdisi-bayi',    name: 'Yurtdisi_Bayi',          type: 'ou', icon: 'ou', children: [] },
        { id: 'ntds-quotas',      name: 'NTDS Quotas',            type: 'container', icon: 'folder', children: [] }
      ]
    }
  ]
};

const AD_OBJECTS = {
  'folsec-group-create': [
    { id: 'g1',  name: 'DEPARTMANLAR_BIRKLASOR_F...',    type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '', disabled: true },
    { id: 'g2',  name: 'DEPARTMANLAR_BT_FULLCON...',     type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '' },
    { id: 'g3',  name: 'DEPARTMANLAR_MODIFY',            type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '', disabled: true },
    { id: 'g4',  name: 'DEPARTMANLAR_READ',              type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '' },
    { id: 'g5',  name: 'DEPARTMENTS_A_B_C_FULLCO...',   type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '' },
    { id: 'g6',  name: 'DEPARTMENTS_FULLCONTROL',        type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '' },
    { id: 'g7',  name: 'DEPARTMENTS_MODIFY',             type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '\\\\demosrv.folsec.lo...\\Departments' },
    { id: 'g8',  name: 'DEPARTMENTS_READ',               type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '', selected: true },
    { id: 'g9',  name: 'DEPARTMENTS_SALES_FULLCO...',   type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '' },
    { id: 'g10', name: 'DEPARTMENTS_TEVFIK_APPLIE...',  type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '', disabled: true },
    { id: 'g11', name: 'DEPARTMENTS_TEVFIK_APPLIE...',  type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '' },
    { id: 'g12', name: 'DEPARTMENTS_TEVFIK_APPLIE...',  type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '' },
    { id: 'g13', name: 'DEPARTMENTS_TEVFIK_APPLIE...',  type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '' },
    { id: 'g14', name: 'DEPARTMENTS_TEVFIK_APPLIE...',  type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '', disabled: true },
    { id: 'g15', name: 'DEPARTMENTS_TEVFIK_APPLIE...',  type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '' },
    { id: 'g16', name: 'Derinlik1_Group01',              type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '' },
    { id: 'g17', name: 'Derinlik2_Group02',              type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '' },
    { id: 'g18', name: 'Derinlik3_Group03',              type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '', disabled: true },
    { id: 'g19', name: 'Description_FULLCONTROL',        type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '\\\\windows2022srv.folsec.local\\Small_Test' },
    { id: 'g20', name: 'Finans Grup',                   type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '' },
    { id: 'g21', name: 'FOLSEC_23C2D4BF_FC',            type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '\\\\folsecdc.folsec.local\\Test Folür' },
    { id: 'g22', name: 'FOLSEC_6FCDDF6_FC',             type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '\\\\folsecdc.folsec.local\\Test Folür' },
    { id: 'g23', name: 'FOLSEC_2A9DB24F_READANDE...',   type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '\\\\folsecdc.folsec.local\\Test Folür', disabled: true },
    { id: 'g24', name: 'FOLSEC_492A6266_FC',             type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '\\\\folsecdc.folsec.local\\Test Folür' },
    { id: 'g25', name: 'FOLSEC_4CB5894F_FC',             type: 'Security Group',  typeDetail: 'Security Group - Domain Local', description: '\\\\folsedc.folsec.local\\Test Folür' },
  ],
  'users': [
    { id: 'u1', name: 'Administrator',   type: 'User',           typeDetail: 'User', description: 'Built-in account for administering the computer/domain' },
    { id: 'u2', name: 'Guest',           type: 'User',           typeDetail: 'User', description: 'Built-in account for guest access to computer/domain', disabled: true },
    { id: 'u3', name: 'Domain Admins',   type: 'Security Group', typeDetail: 'Security Group - Global', description: 'Designated administrators of the domain' },
    { id: 'u4', name: 'Domain Users',    type: 'Security Group', typeDetail: 'Security Group - Global', description: 'All domain users' },
    { id: 'u5', name: 'Domain Guests',   type: 'Security Group', typeDetail: 'Security Group - Global', description: 'All domain guests', disabled: true },
    { id: 'u6', name: 'emir.isik',       type: 'User',           typeDetail: 'User', description: '' },
    { id: 'u7', name: 'tevfik.admin',    type: 'User',           typeDetail: 'User', description: '', disabled: true },
  ],
  'bayiler': [
    { id: 'b1', name: 'Bayi_Admins',   type: 'Security Group', typeDetail: 'Security Group - Domain Local', description: '' },
    { id: 'b2', name: 'Bayi_Read',     type: 'Security Group', typeDetail: 'Security Group - Domain Local', description: '' },
    { id: 'b3', name: 'Bayi_Modify',   type: 'Security Group', typeDetail: 'Security Group - Domain Local', description: '' },
  ],
  'folsec-users': [
    { id: 'fu1', name: 'folsec.admin',  type: 'User', typeDetail: 'User', description: 'FolSec System Admin' },
    { id: 'fu2', name: 'folsec.user1',  type: 'User', typeDetail: 'User', description: '' },
    { id: 'fu3', name: 'folsec.user2',  type: 'User', typeDetail: 'User', description: '' },
  ],
  'domain-ctrl': [
    { id: 'dc1', name: 'FOLSECDC',  type: 'Computer', typeDetail: 'Domain Controller', description: 'Primary Domain Controller' },
  ],
  'computers': [
    { id: 'c1', name: 'WORKSTATION01', type: 'Computer', typeDetail: 'Computer', description: '' },
    { id: 'c2', name: 'WORKSTATION02', type: 'Computer', typeDetail: 'Computer', description: '' },
  ],
  'test-group': [
    { id: 'tg1', name: 'TestGroup_FC',     type: 'Security Group', typeDetail: 'Security Group - Domain Local', description: '\\\\folsecdc.folsec.local\\Test Folür' },
    { id: 'tg2', name: 'TestGroup_Read',   type: 'Security Group', typeDetail: 'Security Group - Domain Local', description: '\\\\folsecdc.folsec.local\\Test Folür' },
    { id: 'tg3', name: 'TestGroup_Modify', type: 'Security Group', typeDetail: 'Security Group - Domain Local', description: '\\\\folsecdc.folsec.local\\Test Folür' },
  ],
  'test-users': [
    { id: 'tu1', name: 'test.user1', type: 'User', typeDetail: 'User', description: 'Test Account' },
    { id: 'tu2', name: 'test.user2', type: 'User', typeDetail: 'User', description: 'Test Account' },
  ],
};

const CONTEXT_MENU_ITEMS = {
  ou: [
    { id: 'new', label: 'New', icon: 'plus', submenu: [
      { id: 'new-user',  label: 'User',               icon: 'user-plus' },
      { id: 'new-group', label: 'Group',              icon: 'users' },
      { id: 'new-ou',    label: 'Organizational Unit', icon: 'folder-plus' },
      { id: 'new-comp',  label: 'Computer',           icon: 'server' },
    ]},
    { id: 'sep1', separator: true },
    { id: 'find',       label: 'Find...',    icon: 'search' },
    { id: 'sep2', separator: true },
    { id: 'cut',        label: 'Cut',        icon: 'scissors' },
    { id: 'copy',       label: 'Copy',       icon: 'copy' },
    { id: 'paste',      label: 'Paste',      icon: 'clipboard' },
    { id: 'sep3', separator: true },
    { id: 'delete',     label: 'Delete',     icon: 'trash-2' },
    { id: 'rename',     label: 'Rename',     icon: 'edit-2' },
    { id: 'move',       label: 'Move...',    icon: 'move' },
    { id: 'sep4', separator: true },
    { id: 'properties', label: 'Properties', icon: 'settings' },
  ],
  object: [
    { id: 'copy',        label: 'Copy',            icon: 'copy' },
    { id: 'add-to-group',label: 'Add to a group...', icon: 'user-plus' },
    { id: 'disable',     label: 'Disable Account', icon: 'user-x' },
    { id: 'reset-pw',    label: 'Reset Password...', icon: 'key' },
    { id: 'sep1', separator: true },
    { id: 'move',        label: 'Move...',          icon: 'move' },
    { id: 'delete',      label: 'Delete',           icon: 'trash-2' },
    { id: 'rename',      label: 'Rename',           icon: 'edit-2' },
    { id: 'sep2', separator: true },
    { id: 'properties',  label: 'Properties',       icon: 'settings' },
  ]
};
