import * as React from "react";
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

const SearchControl: React.FunctionComponent = props => {
    return (
        <div
          className="mapseed-search-control"
          style={{
            position: "absolute",
            bottom: "8px",
            right: "200px",
            display: "flex",
            backgroundColor: "white"
          }}
        >
          <TextField
            id="outlined-size-small"
            variant="outlined"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                      edge="end"
                    >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
    );
  };

  export default (SearchControl);
  