import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  useColorModeValue,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Box,
} from "@chakra-ui/react";
import LiveDetection from "./LiveDetection";
import getcookie from "../../getcookie";
import {baseurl} from "../../zacserver";

interface ModuleData {
  response: {
    result: {
      current_data: {
        detection: string;
        alert_level: number;
        updatedAt: string;
      };
      daily_data: [
        {
          detection: string;
          alert_level: number;
          updatedAt: string;
        }
      ];
    };
  };
}

export default function IntrusionDetectionArea() {
  const [CurrentData, setCurrentData] = useState({
    detection: "",
    alert_level: 0,
    updatedAt: "",
  });
  const [DailyData, setDailyData] = useState([
    {
      detection: "",
      alert_level: 0,
      updatedAt: "",
    },
  ]);

  function getData() {
    axios
      .get<ModuleData>(
        baseurl+"/api/intruders?id=" +
          getcookie("intruders_id", true)
      )
      .then((res) => {
        const { data } = res;
        let current_data = data.response.result.current_data;
        let daily_data = data.response.result.daily_data;
        console.log("GET INTRUDERSMODULEDATA: ", current_data, daily_data);
        setCurrentData(current_data);
        setDailyData(daily_data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function convertDate(date: string) {
    let date_obj = new Date(date);
    let day = date_obj.getDate();
    let month = date_obj.getMonth() + 1;
    let year = date_obj.getFullYear();
    let hours = date_obj.getHours();
    let minutes = date_obj.getMinutes();
    let seconds = date_obj.getSeconds();
    let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let non_24_hour_time = hours > 12 ? hours - 12 : hours;
    let actual_hr = "";
    let actual_min = "";
    let actual_sec = "";
    if (hours > 12) {
      let actual_hr = non_24_hour_time.toString();
      let actual_min = minutes.toString();
      let actual_sec = seconds.toString();
      if (hours < 10) {
        actual_hr = "0" + non_24_hour_time;
      }
      if (minutes < 10) {
        actual_min = "0" + minutes;
      }
      if (seconds < 10) {
        actual_sec = "0" + seconds;
      }
      return `${days[date_obj.getDay()]}, ${
        months[month - 1]
      } ${day}, ${year} ${actual_hr}:${actual_min}:${actual_sec} PM`;
    } else {
      return `${days[date_obj.getDay()]}, ${
        months[month - 1]
      } ${day}, ${year} ${actual_hr}:${actual_min}:${actual_sec} AM`;
    }
  }

  useEffect(() => {
    var handle = setInterval(getData, 2500);
    return () => {
      clearInterval(handle);
    };
  });

  return (
    <>
      <LiveDetection
        date={convertDate(CurrentData.updatedAt)}
        detection_level={CurrentData.detection}
        alert_level={CurrentData.alert_level}
      />
      <Box
        style={{ overflowY: "scroll", maxHeight: "32vh" }}
        rounded="lg"
        shadow="lg"
      >
        <Table
          w="full"
          bg={useColorModeValue("white", "gray.800")}
          display={{
            base: "block",
            md: "table",
          }}
          sx={{
            "@media print": {
              display: "table",
            },
          }}
        >
          <Thead
            display={{
              base: "none",
              md: "table-header-group",
            }}
            sx={{
              "@media print": {
                display: "table-header-group",
              },
            }}
            bg={useColorModeValue("white", "gray.800")}
            style={{ position: "sticky", top: 0 }}
          >
            <Tr>
              <Th key={"Date & Time"}>Date & Time</Th>
              <Th key={"Detection"}>Detection</Th>
              <Th key={"Alert Level"}>Alert Level</Th>
            </Tr>
          </Thead>
          <Tbody
            display={{
              base: "block",
              lg: "table-row-group",
            }}
            sx={{
              "@media print": {
                display: "table-row-group",
              },
            }}
          >
            {DailyData.map((item) => item)
              .reverse()
              .map((data, index) => {
                return (
                  <Tr key={index}>
                    <Td key={"Date & Time"}>{convertDate(data.updatedAt)}</Td>
                    <Td key={"Detection"}>{data.detection}</Td>
                    <Td key={"Alert Level"}>{data.alert_level}</Td>
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
      </Box>
    </>
  );
}
