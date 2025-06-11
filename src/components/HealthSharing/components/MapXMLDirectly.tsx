import React, { useState } from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useSelector } from 'react-redux';
import DocumentDetails from './DocumentDetails';
import { formatDateCCDADate, isNull } from '@/utils/functions';
import moment from 'moment';


const extractNodeText = (node: any): string => {
  let value = '';

  if (typeof node === 'string') {
    value = node;
  } else if (typeof node._ === 'string') {
    value = node._;
  } else if (node.content && typeof node.content._ === 'string') {
    value = node.content._;
  }

  // Check if value is a date in format YYYYMMDD (like "20150621")
  if (/^\d{8}$/.test(value)) {
    return formatDateCCDADate(value);
  }

  return value;
};

const extractFromNestedContent = (contentObj: any): string => {
  if (!contentObj) return '';

  let result = '';

  // Get text from current level
  if (contentObj._ && typeof contentObj._ === 'string') {
    result += contentObj._;
  }

  // Recursively get text from nested content
  if (contentObj.content) {
    result += extractFromNestedContent(contentObj.content);
  }

  return result;
};

const renderCcdaList = (listNode: any): React.ReactNode => {
  if (!listNode?.item) return null;
  const isOrdered = listNode.$?.listType === 'ordered';
  const items = Array.isArray(listNode.item) ? listNode.item : [listNode.item];
  return (
    <List
      component={isOrdered ? 'ol' : 'ul'}
      sx={{ listStyleType: isOrdered ? 'decimal' : 'disc', pl: 4 }}
    >
      {items.map((item: any, idx: number) => (
        <ListItem key={idx} sx={{ display: 'list-item', py: 0 }}>
          {typeof item === 'string' || item._ ? (
            <ListItemText
              primary={typeof item === 'string' ? item : item._}
              sx={{ m: 0 }}
            />
          ) : (
            <Box sx={{ width: '100%' }}>
              {item._ && <Typography>{item._}</Typography>}
              {item.list && renderCcdaList(item.list)}
            </Box>
          )}
        </ListItem>
      ))}
    </List>
  );
};

const renderCcdaContentList = (node: any): React.ReactNode => {
  const extractNodeText = (item: any): string => {
    if (!item) return '';

    let text =
      typeof item._ === 'string'
        ? item._
        : typeof item === 'string'
        ? item
        : '';

    if (item.content) {
      const contentArray = Array.isArray(item.content)
        ? item.content
        : [item.content];
      text += contentArray.map(extractNodeText).join('');
    }

    return text.replace(/\s+/g, ' ').trim();
  };

  const paraArray = Array.isArray(node.paragraph)
    ? node.paragraph
    : node.paragraph
    ? [node.paragraph]
    : [];

  const listArray = Array.isArray(node.list)
    ? node.list
    : node.list
    ? [node.list]
    : [];

  const renderListItems = (items: any[]): React.ReactNode =>
    items.map((item: any, idx: number) => {
      const label = extractNodeText(item);
      const paragraphs: string[] = [];
      let subListItems: any[] = [];

      if (item?.content) {
        const contentArray = Array.isArray(item.content)
          ? item.content
          : [item.content];
        contentArray.forEach((child: any) => {
          if (child.paragraph) {
            paragraphs.push(extractNodeText(child.paragraph));
          }
          if (child.list?.item) {
            const childItems = Array.isArray(child.list.item)
              ? child.list.item
              : [child.list.item];
            subListItems.push(...childItems);
          }
        });
      }

      // Also handle nested "list" under item directly
      if (item?.list?.item) {
        const nestedItems = Array.isArray(item.list.item)
          ? item.list.item
          : [item.list.item];
        subListItems.push(...nestedItems);
      }

      return (
        <ListItem
          key={`item-${idx}`}
          sx={{
            display: 'list-item',
            flexDirection: 'column',
            alignItems: 'flex-start',
            py: 0
          }}
        >
          {(label || paragraphs.length > 0) && (
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 'bold', whiteSpace: 'pre-line' }}
            >
              {label}
            </Typography>
          )}

          {paragraphs.map((text, i) => (
            <Typography
              key={`para-${idx}-${i}`}
              variant="subtitle2"
              sx={{ fontWeight: 'bold', whiteSpace: 'pre-line' }}
            >
              {text}
            </Typography>
          ))}

          {subListItems.length > 0 && (
            <List component="ul" sx={{ listStyleType: 'circle', pl: 4 }}>
              {renderListItems(subListItems)}
            </List>
          )}
        </ListItem>
      );
    });

  return (
    <Box>
      {paraArray.length === 0 && listArray.length > 0 ? (
        <>
          {typeof node.content === 'string' && (
            <Typography variant="h6" gutterBottom>
              {node.content.replace(/\s+/g, ' ').trim()}
            </Typography>
          )}

          {listArray.map((listBlock, index) => {
            const itemsToRender = Array.isArray(listBlock.item)
              ? listBlock.item
              : [listBlock.item];
            const listStyle =
              listBlock?.$?.listType === 'ordered' ? 'decimal' : 'disc';

            return (
              <List
                key={`only-list-${index}`}
                component="ol"
                sx={{ listStyleType: listStyle, pl: 4, mb: 2 }}
              >
                {renderListItems(itemsToRender)}
              </List>
            );
          })}
        </>
      ) : (
        paraArray.map((para, index) => {
          const paragraphText = extractNodeText(para);
          const listBlock = listArray[index];
          const itemsToRender = listBlock?.item
            ? Array.isArray(listBlock.item)
              ? listBlock.item
              : [listBlock.item]
            : [];

          const listStyle =
            listBlock?.$?.listType === 'ordered' ? 'decimal' : 'disc';

          return (
            <Box key={`para-block-${index}`} sx={{ mb: 2 }}>
              {paragraphText && (
                <Typography variant="h6" gutterBottom>
                  {paragraphText}
                </Typography>
              )}

              {itemsToRender.length > 0 && (
                <List component="ol" sx={{ listStyleType: listStyle, pl: 4 }}>
                  {renderListItems(itemsToRender)}
                </List>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
};

const MapXMLDirectly = ({ XmlToJson }) => {
  const components =
    XmlToJson?.ClinicalDocument?.component?.structuredBody?.component || [];


    

  const getFullName = (nameData: any): string => {
    if (!nameData) return '';

    const formatGiven = (given: any): string => {
      if (Array.isArray(given)) {
        return given
          .map((g) => {
            if (typeof g === 'string') return g;
            if (typeof g === 'object' && g._ && !g.$?.qualifier) return g._;
            return ''; // Skip if has qualifier or invalid
          })
          .filter(Boolean)
          .join(' ');
      }

      if (typeof given === 'string') {
        return given;
      }

      if (typeof given === 'object' && given._ && !given.$?.qualifier) {
        return given._;
      }

      return '';
    };

    // Handle array of name objects (use first one)
    if (Array.isArray(nameData) && nameData.length > 0) {
      const first = nameData[0];
      const given = formatGiven(first?.given[0]);
      const family = first?.family || '';
      return `${given} ${family}`.trim();
    }

    // Handle single name object
    if (typeof nameData === 'object') {
      const suffix = nameData.suffix || '';

      if (!('family' in nameData)) {
        // family key exist nahi karti
        const givenArray = Array.isArray(nameData.given)
          ? nameData.given
              .map((item) => {
                if (typeof item === 'string') return item;
                if (typeof item === 'object' && item._) return item._;
                return '';
              })
              .filter(Boolean)
          : [nameData.given];

        const fullGiven = givenArray.join(' ');
        return `${fullGiven}${suffix ? ' ' + suffix : ''}`.trim();
      } else {
        // family key exist karti hai
        const given = formatGiven(
          Array.isArray(nameData.given) && nameData.given.length > 0
            ? nameData.given[0]
            : nameData.given
        );
        const family = nameData.family || '';
        const fullName = `${given} ${family}${
          suffix ? ', ' + suffix : ''
        }`.trim();

        if (!given && !family && !suffix) {
          return ',';
        }

        return fullName;
      }
    }

    return '';
  };

  return (
    <Box sx={{ pt: 1 }}>
      {!isNull(XmlToJson) && (
        <>
          <Box
            sx={{
              height: {
                md: '10vh',
                lg: '10vh',
                xl: '8vh'
              },
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <Box
              sx={{
                height: {
                  md: '10vh',
                  lg: '10vh',
                  xl: '8vh'
                },
                width: '100%',
                p: 1
              }}
            >
              <Typography
                variant="inherit"
                sx={{
                  fontWeight: 400,
                  color: 'black',
                  fontSize: '13px',
                  mb: 0
                }}
              >
                <span style={{ fontWeight: 600 }}>Patient:</span>{' '}
                {getFullName(
                  XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                    ?.patient?.name
                )}
              </Typography>

              <Typography
                variant="inherit"
                sx={{
                  fontWeight: 400,
                  color: 'black',
                  fontSize: '13px',
                  mb: 0
                }}
              >
                <span style={{ fontWeight: 600 }}>Gender:</span>{' '}
                {XmlToJson?.ClinicalDocument?.recordTarget?.patientRole?.patient
                  ?.administrativeGenderCode?.code === 'M'
                  ? 'Male'
                  : XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                      ?.patient?.administrativeGenderCode?.code === 'F'
                  ? 'Female'
                  : XmlToJson?.ClinicalDocument?.recordTarget?.patientRole
                      ?.patient?.administrativeGenderCode?.code === 'UNK'
                  ? 'Unknown'
                  : ''}
              </Typography>
            </Box>

            <Box
              sx={{
                height: {
                  md: '10vh',
                  lg: '10vh',
                  xl: '8vh'
                },
                width: '100%',
                p: 1
              }}
            ></Box>
          </Box>
          <DocumentDetails XmlToJson={XmlToJson} />
        </>
      )}

      {components?.map((comp: any, idx: number) => {
        const { section } = comp;
        const text = section.text;
        const content = section?.text?.content?._;
        const familyRelation = section?.text?.paragraph;

        if (text?.table) {
          const tables = Array.isArray(text.table) ? text.table : [text.table];

          return (
            <Box key={idx} mb={1}>
              <Typography pl={1} variant="h6" gutterBottom>
                {section.title}
                {content && (
                  <Box>
                    <Typography variant="h6">{content}</Typography>
                  </Box>
                )}
                {familyRelation && (
                  <Box>
                    <Typography variant="h6">{familyRelation}</Typography>
                  </Box>
                )}
              </Typography>
              {tables.map((table: any, tableIndex: number) => {
                const thead = table?.thead;
                const tbody = table?.tbody;
                const rawHeaderRows = thead?.tr;
                const headerRows = Array.isArray(rawHeaderRows)
                  ? rawHeaderRows
                  : rawHeaderRows
                  ? [rawHeaderRows]
                  : [];
                const rawRows = tbody?.tr;
                const rows = Array.isArray(rawRows)
                  ? rawRows
                  : rawRows
                  ? [rawRows]
                  : [];

                // Extract the Hand-off Communication content text if present in your JSON input:
                // Assuming your `text` object contains this content at the same level as table
                const handOffContent = text?.content?._?.trim() || '';

                return (
                  <TableContainer
                    key={tableIndex}
                    sx={{
                      p: 1,
                      elevation: 3,
                      maxHeight: 400,
                      overflow: 'auto',
                      mb: 2,
                      width: '100%'
                    }}
                  >
                    <Table
                      size="small"
                      sx={{ border: '1px solid lightGray', p: 1 }}
                    >
                      <TableHead>
                        <TableRow>
                          {headerRows.map((headerRow: any, hrIdx: number) => {
                            const th = headerRow.th;
                            const thArray = Array.isArray(th)
                              ? th
                              : th
                              ? [th]
                              : [];

                            return thArray.map((head: any, hi: number) => {
                              const label = extractNodeText(head).trim();
                              const align = head?.$?.align || 'left';
                              const colspan = 1;

                              return (
                                <TableCell
                                  key={`header-cell-${hrIdx}-${hi}`}
                                  align={align}
                                  colSpan={colspan}
                                  sx={{
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    backgroundColor: '#f5f5f5'
                                  }}
                                >
                                  {label}
                                </TableCell>
                              );
                            });
                          })}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {rows.map((row: any, rIdx: number) => {
                          const rowHeader = row.th;
                          const rawCells = row.td;
                          const cells = (
                            Array.isArray(rawCells)
                              ? rawCells
                              : rawCells
                              ? [rawCells]
                              : []
                          ).map((cell) => {
                            if (cell?.list?.item) {
                              const items = Array.isArray(cell.list.item)
                                ? cell.list.item
                                : [cell.list.item];
                              return {
                                ...cell,
                                _renderAsList: true,
                                _listItems: items
                              };
                            }
                            return cell;
                          });

                          return (
                            <TableRow key={rIdx}>
                              {rowHeader && (
                                <TableCell
                                  component="th"
                                  scope="row"
                                  align={rowHeader.$?.align || 'left'}
                                  sx={{ fontWeight: '400' }}
                                >
                                  {extractNodeText(rowHeader).trim()}
                                </TableCell>
                              )}
                              {cells.map((cell: any, cIdx: number) => {
                                const align = cell?.$?.align || 'left';

                                return (
                                  <TableCell
                                    key={cIdx}
                                    align={align}
                                    sx={{
                                      py: 1,
                                      px: 2,
                                      whiteSpace: 'normal',
                                      overflowWrap: 'break-word',
                                      wordBreak: 'break-word',
                                      maxWidth: '200px'
                                    }}
                                  >
                                    <Typography variant="body2">
                                      {cell._renderAsList ? (
                                        <ul
                                          style={{
                                            margin: 0,
                                            paddingLeft: '1rem'
                                          }}
                                        >
                                          {cell._listItems.map(
                                            (item: string, i: number) => (
                                              <li key={i}>{item}</li>
                                            )
                                          )}
                                        </ul>
                                      ) : (
                                        extractNodeText(cell).trim()
                                      )}
                                    </Typography>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                );
              })}
            </Box>
          );
        }

        if (typeof text === 'string') {
          return (
            <Box key={idx} mb={4}>
               <h3 style={{ marginBottom: 2 }}>
                {section.title}
              </h3>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.6,
                  textAlign: 'justify',
                  px: 1
                }}
              >
                {text}
              </Typography>
            </Box>
          );
        }

        if (text?.content && !text?.table && !text?.list && !text?.paragraph) {
          const extractedText = extractFromNestedContent(text.content);
          return (
            <Box key={idx} mb={4}>
              <h3 style={{ marginBottom: 2 }}>
                {section.title}
              </h3>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.6,
                  textAlign: 'justify',
                  px: 1
                }}
              >
                {extractedText}
              </Typography>
            </Box>
          );
        }

        if (text?.content || text?._ || text?.list || text?.paragraph) {
          return (
            <Box key={idx} mb={4}>
              <h3 style={{ marginBottom: 2 }}>
                {section.title}
              </h3>
              {renderCcdaContentList(text)}
            </Box>
          );
        }

        return null;
      })}
    </Box>
  );
};

export default MapXMLDirectly;
