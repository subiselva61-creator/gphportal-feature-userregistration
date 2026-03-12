import React, { useState, useEffect, useRef } from "react";
import { Navigate } from 'react-router-dom';
import { useSelector } from "react-redux";

import UserService from "../services/user.service";
import EventBus from "../common/EventBus";
import DataTable from 'datatables.net-react';
import '../css_styles/BoardUser.css'
import Table from 'rc-table';

function App() {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 100,
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      width: 200,
    },
  ];
  const [content, setContent] = useState("");

  const Search = (searchName) => {
    UserService.getUserBoard(searchName).then(
      (response) => {
        setContent(response.data);
      },
      (error) => {
        const _content =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setContent(_content);

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout");
        }
      });
  }

  useEffect(() => {
    Search("");
  }, []);

  function handleChange(e) {
    Search(e.target.value);
  }
  const { user: currentUser } = useSelector((state) => state.auth);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (<div className="container">
    <header className="jumbotron">
      <b>Search: </b><input type="text" id="search" placeholder="Search for names.." title="Type in a name" />
      <hr />
      <Table columns={columns} data={content} />
    </header>
  </div>
  );
}

export default App;